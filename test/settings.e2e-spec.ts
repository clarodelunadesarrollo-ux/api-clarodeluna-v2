import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

const OTP_CHANNEL_KEY = 'otp.local_notification_enabled';

describe('Settings OTP channel (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const emails: string[] = [];
  const uniqueEmail = (tag: string): string => {
    const email = `e2e_settings_${tag}_${Date.now()}@e2e.test`;
    emails.push(email);
    return email;
  };

  const issueAccessToken = async (): Promise<string> => {
    const email = uniqueEmail('token');
    const otpRequest = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(200);
    const otp = otpRequest.body.data.otp as string;

    const validate = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/validate')
      .send({ email, otp })
      .expect(200);
    return validate.body.data.accessToken as string;
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
    // Restore the flag to its default (true) so other suites are unaffected.
    await prisma.appSetting.upsert({
      where: { key: OTP_CHANNEL_KEY },
      create: { key: OTP_CHANNEL_KEY, value: 'true' },
      update: { value: 'true' },
    });

    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.otpCode.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    await app.close();
  });

  it('exposes the OTP channel flag without authentication (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/settings/otp-channel')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.localNotificationEnabled).toBe('boolean');
  });

  it('rejects updating the flag without a token (401)', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/settings/otp-channel')
      .send({ localNotificationEnabled: false })
      .expect(401);
  });

  it('updates the flag with a valid token and reflects it on read (200)', async () => {
    const token = await issueAccessToken();

    const patch = await request(app.getHttpServer())
      .patch('/api/v1/settings/otp-channel')
      .set('Authorization', `Bearer ${token}`)
      .send({ localNotificationEnabled: false })
      .expect(200);

    expect(patch.body.success).toBe(true);
    expect(patch.body.data.localNotificationEnabled).toBe(false);

    const afterPatch = await request(app.getHttpServer())
      .get('/api/v1/settings/otp-channel')
      .expect(200);
    expect(afterPatch.body.data.localNotificationEnabled).toBe(false);

    const restore = await request(app.getHttpServer())
      .patch('/api/v1/settings/otp-channel')
      .set('Authorization', `Bearer ${token}`)
      .send({ localNotificationEnabled: true })
      .expect(200);
    expect(restore.body.data.localNotificationEnabled).toBe(true);
  });

  it('rejects a non-boolean payload (400)', async () => {
    const token = await issueAccessToken();

    await request(app.getHttpServer())
      .patch('/api/v1/settings/otp-channel')
      .set('Authorization', `Bearer ${token}`)
      .send({ localNotificationEnabled: 'nope' })
      .expect(400);
  });
});
