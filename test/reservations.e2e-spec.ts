import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Full-stack E2E for the reservations API. Boots the real AppModule against the
 * dev Postgres, mirrors the production pipes/filters/interceptors/prefix and
 * drives a disposable test user through the OTP flow to obtain a real JWT. All
 * data created by the suite is removed in afterAll.
 */
describe('Reservations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let reservationId: string;

  const userEmail = `e2e_${Date.now()}@e2e.test`;
  const bookingDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const authed = (method: 'get' | 'post' | 'patch' | 'delete', path: string) =>
    request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${accessToken}`);

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
    refreshToken = otpValidate.body.data.refreshToken;
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (user) {
      await prisma.reservation.deleteMany({ where: { userId: user.id } });
      await prisma.otpCode.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  describe('Auth guard', () => {
    it('rejects an unauthenticated request (401)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reservations')
        .expect(401);
      expect(response.body).toMatchObject({ success: false, statusCode: 401 });
    });
  });

  describe('Validation', () => {
    it('rejects an out-of-range party size (400)', async () => {
      const response = await authed('post', '/api/v1/reservations')
        .send({
          type: 'RESTAURANT',
          date: bookingDate,
          time: '12:00',
          partySize: 99,
        })
        .expect(400);
      expect(response.body.success).toBe(false);
    });

    it('rejects an unknown field (400 whitelist)', async () => {
      await authed('post', '/api/v1/reservations')
        .send({
          type: 'RESTAURANT',
          date: bookingDate,
          time: '12:00',
          partySize: 2,
          hacker: true,
        })
        .expect(400);
    });
  });

  describe('CRUD flow', () => {
    it('creates a RESTAURANT reservation (201)', async () => {
      const response = await authed('post', '/api/v1/reservations')
        .send({
          type: 'RESTAURANT',
          date: bookingDate,
          time: '12:00',
          partySize: 2,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          type: 'RESTAURANT',
          date: bookingDate,
          time: '12:00',
          partySize: 2,
          status: 'ACTIVE',
        },
      });
      reservationId = response.body.data.id;
    });

    it('lists the reservations of the authenticated user (200)', async () => {
      const response = await authed('get', '/api/v1/reservations').expect(200);
      const ids = (response.body.data as Array<{ id: string }>).map(
        (r) => r.id,
      );
      expect(ids).toContain(reservationId);
    });

    it('updates the party size of the reservation (200)', async () => {
      const response = await authed(
        'patch',
        `/api/v1/reservations/${reservationId}`,
      )
        .send({ partySize: 4 })
        .expect(200);
      expect(response.body.data.partySize).toBe(4);
    });

    it('cancels the reservation and returns its id (200)', async () => {
      const response = await authed(
        'delete',
        `/api/v1/reservations/${reservationId}`,
      ).expect(200);
      expect(response.body.data).toMatchObject({ id: reservationId });
    });
  });

  describe('Configuration endpoints', () => {
    it('returns the tour slots for a date (200)', async () => {
      const response = await authed(
        'get',
        `/api/v1/reservations/config/tour-slots?date=${bookingDate}`,
      ).expect(200);
      expect(Array.isArray(response.body.data.slots)).toBe(true);
    });

    it('returns the restaurant hours (200)', async () => {
      const response = await authed(
        'get',
        '/api/v1/reservations/config/restaurant-hours',
      ).expect(200);
      expect(response.body.data).toMatchObject({
        openTime: expect.any(String),
        closeTime: expect.any(String),
        intervalMinutes: expect.any(Number),
      });
    });
  });

  describe('Token refresh flow', () => {
    it('rotates the token pair with a valid refresh token (200)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/otp/refresh')
        .send({ refreshToken })
        .expect(200);
      expect(response.body.data).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('rejects a malformed refresh token at the DTO boundary (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/otp/refresh')
        .send({ refreshToken: 'not.a.valid.jwt' })
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });
});
