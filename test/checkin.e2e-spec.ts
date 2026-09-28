import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Full-stack E2E for the venue check-in endpoint. Boots the real AppModule,
 * mirrors the production pipes/filters/interceptors/prefix and drives a
 * disposable user through the OTP flow to obtain a real JWT. Verifies the auth
 * guard, the response shape, and that the code is stable within a period.
 */
describe('Checkin (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  const userEmail = `e2e_checkin_${Date.now()}@e2e.test`;

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
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (user) {
      await prisma.otpCode.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  it('rejects an unauthenticated request (401)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/checkin/current-code')
      .expect(401);
    expect(response.body).toMatchObject({ success: false, statusCode: 401 });
  });

  it('returns the current venue code with rotation metadata (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/checkin/current-code')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    const { code, qrPayload, periodStart, periodEnd } = response.body.data;
    expect(code).toMatch(/^\d{4}$/);
    expect(qrPayload).toBe(code);
    expect(new Date(periodEnd).getTime()).toBeGreaterThan(
      new Date(periodStart).getTime(),
    );
  });

  it('returns the same code for two requests in the same period', async () => {
    const first = await request(app.getHttpServer())
      .get('/api/v1/checkin/current-code')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const second = await request(app.getHttpServer())
      .get('/api/v1/checkin/current-code')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(second.body.data.code).toBe(first.body.data.code);
  });
});
