import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Full-stack E2E for the OTP auth flow. Boots the real AppModule and mirrors the
 * production pipes/filters/interceptors/prefix. Drives disposable users through
 * request -> validate -> refresh, and checks the error and cooldown paths.
 * Relies on EXPOSE_OTP_IN_RESPONSE=true to read the generated OTP.
 */
describe('Auth OTP (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const emails: string[] = [];
  const uniqueEmail = (tag: string): string => {
    const email = `e2e_auth_${tag}_${Date.now()}@e2e.test`;
    emails.push(email);
    return email;
  };

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
  });

  afterAll(async () => {
    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.otpCode.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    await app.close();
  });

  it('issues a 6-digit OTP with rotation metadata (200)', async () => {
    const email = uniqueEmail('request');
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.otp).toMatch(/^\d{6}$/);
    expect(response.body.data.expiresAt).toBeDefined();
    expect(response.body.data.resendAvailableAt).toBeDefined();
  });

  it('rejects an invalid email format (400)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email: 'not-an-email' })
      .expect(400);

    expect(response.body).toMatchObject({ success: false, statusCode: 400 });
  });

  it('validates a correct OTP and issues a token pair (200)', async () => {
    const email = uniqueEmail('validate');
    const otpRequest = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(200);
    const otp = otpRequest.body.data.otp as string;

    const validate = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/validate')
      .send({ email, otp })
      .expect(200);

    expect(validate.body.success).toBe(true);
    expect(typeof validate.body.data.accessToken).toBe('string');
    expect(typeof validate.body.data.refreshToken).toBe('string');

    const refresh = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/refresh')
      .send({ refreshToken: validate.body.data.refreshToken })
      .expect(200);

    expect(typeof refresh.body.data.accessToken).toBe('string');
    expect(typeof refresh.body.data.refreshToken).toBe('string');
  });

  it('rejects a wrong OTP (401)', async () => {
    const email = uniqueEmail('wrong');
    const otpRequest = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(200);
    const otp = otpRequest.body.data.otp as string;
    const wrongOtp = otp === '000000' ? '111111' : '000000';

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/validate')
      .send({ email, otp: wrongOtp })
      .expect(401);

    expect(response.body).toMatchObject({ success: false, statusCode: 401 });
  });

  it('enforces the resend cooldown on an immediate second request (429)', async () => {
    const email = uniqueEmail('cooldown');
    await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(429);

    expect(response.body).toMatchObject({ success: false, statusCode: 429 });
  });
});
