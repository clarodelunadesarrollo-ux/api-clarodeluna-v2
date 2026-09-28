import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Full-stack E2E for the self check-in (arrival) endpoint. Drives a disposable
 * user through the OTP flow to obtain a real JWT, seeds a reservation for the
 * current Bogota day/time directly via Prisma (deterministic, independent of the
 * booking availability rules), reads the real rotating venue code and exercises
 * the happy path plus the 401/404/422 error mappings. Cleanup runs in afterAll.
 */
describe('Checkin arrival (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let currentCode: string;

  const userEmail = `e2e_arrival_${Date.now()}@e2e.test`;
  const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);

    const otpRequest = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email: userEmail })
      .expect(200);
    const otp = otpRequest.body.data.otp as string;

    const otpValidate = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/validate')
      .send({ email: userEmail, otp })
      .expect(200);
    accessToken = otpValidate.body.data.accessToken;

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      throw new Error('Test user was not created by the OTP flow');
    }
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({ where: { userId } });
    await prisma.otpCode.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  describe('without an eligible reservation', () => {
    it('rejects an unauthenticated request (401)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/checkin/arrival')
        .send({ code: '0000' })
        .expect(401);
      expect(response.body).toMatchObject({ success: false, statusCode: 401 });
    });

    it('returns 404 when the user has no active reservation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/checkin/arrival')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ code: '0000' })
        .expect(404);
      expect(response.body).toMatchObject({ success: false, statusCode: 404 });
    });
  });

  describe('with an eligible reservation in the window', () => {
    beforeAll(async () => {
      // Bogota wall clock (UTC-5) represented through UTC getters.
      const bogotaNow = new Date(Date.now() - BOGOTA_OFFSET_MS);
      const time = `${String(bogotaNow.getUTCHours()).padStart(2, '0')}:${String(
        bogotaNow.getUTCMinutes(),
      ).padStart(2, '0')}`;
      const date = new Date(
        Date.UTC(
          bogotaNow.getUTCFullYear(),
          bogotaNow.getUTCMonth(),
          bogotaNow.getUTCDate(),
        ),
      );

      await prisma.reservation.create({
        data: {
          userId,
          type: 'RESTAURANT',
          date,
          time,
          partySize: 2,
          holderName: 'E2E Arrival',
        },
      });

      const codeResponse = await request(app.getHttpServer())
        .get('/api/v1/checkin/current-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      currentCode = codeResponse.body.data.code as string;
    });

    it('rejects a wrong code (422) and keeps the reservation ACTIVE', async () => {
      const wrongCode = currentCode === '0000' ? '1111' : '0000';
      const response = await request(app.getHttpServer())
        .post('/api/v1/checkin/arrival')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ code: wrongCode })
        .expect(422);
      expect(response.body).toMatchObject({ success: false, statusCode: 422 });

      const rows = await prisma.reservation.findMany({ where: { userId } });
      expect(rows[0].status).toBe('ACTIVE');
    });

    it('checks in the reservation with the current code (200)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/checkin/arrival')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ code: currentCode })
        .expect(200);
      expect(response.body).toMatchObject({
        success: true,
        data: { status: 'CHECKED_IN' },
      });
    });
  });
});
