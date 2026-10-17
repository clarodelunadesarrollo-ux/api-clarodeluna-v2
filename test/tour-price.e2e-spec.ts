import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

const TOUR_PRICE_CENTS_KEY = 'tour.price_cents';
const TOUR_PRICE_CENTS_DEFAULT = '5000000';

describe('Settings tour price (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const emails: string[] = [];
  const uniqueEmail = (tag: string): string => {
    const email = `e2e_tour_price_${tag}_${Date.now()}@e2e.test`;
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

  // Issues a token for a fresh user and promotes it to ADMIN so it passes the
  // RolesGuard on the PATCH route.
  const issueAdminToken = async (): Promise<string> => {
    const email = uniqueEmail('admin');
    const otpRequest = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(200);
    const otp = otpRequest.body.data.otp as string;

    const validate = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/validate')
      .send({ email, otp })
      .expect(200);

    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
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

    // Known baseline so the GET assertions are deterministic.
    await prisma.appSetting.upsert({
      where: { key: TOUR_PRICE_CENTS_KEY },
      create: { key: TOUR_PRICE_CENTS_KEY, value: TOUR_PRICE_CENTS_DEFAULT },
      update: { value: TOUR_PRICE_CENTS_DEFAULT },
    });
  });

  afterAll(async () => {
    // Restore the price to its default so other suites are unaffected.
    await prisma.appSetting.upsert({
      where: { key: TOUR_PRICE_CENTS_KEY },
      create: { key: TOUR_PRICE_CENTS_KEY, value: TOUR_PRICE_CENTS_DEFAULT },
      update: { value: TOUR_PRICE_CENTS_DEFAULT },
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

  it('exposes the tour price without authentication (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/settings/tour-price')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.priceCents).toBe('number');
    expect(response.body.data.priceCents).toBe(5000000);
  });

  it('rejects updating the price without a token (401)', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-price')
      .send({ priceCents: 7500000 })
      .expect(401);
  });

  it('rejects updating the price with a non-admin token (403)', async () => {
    const token = await issueAccessToken();

    await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-price')
      .set('Authorization', `Bearer ${token}`)
      .send({ priceCents: 7500000 })
      .expect(403);
  });

  it('updates the price with an admin token and reflects it on read (200)', async () => {
    const token = await issueAdminToken();

    const patch = await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-price')
      .set('Authorization', `Bearer ${token}`)
      .send({ priceCents: 7500000 })
      .expect(200);

    expect(patch.body.success).toBe(true);
    expect(patch.body.data.priceCents).toBe(7500000);

    const afterPatch = await request(app.getHttpServer())
      .get('/api/v1/settings/tour-price')
      .expect(200);
    expect(afterPatch.body.data.priceCents).toBe(7500000);
  });

  it('rejects a negative price (400)', async () => {
    const token = await issueAdminToken();

    await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-price')
      .set('Authorization', `Bearer ${token}`)
      .send({ priceCents: -1 })
      .expect(400);
  });

  it('rejects a non-integer price (400)', async () => {
    const token = await issueAdminToken();

    await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-price')
      .set('Authorization', `Bearer ${token}`)
      .send({ priceCents: 1.5 })
      .expect(400);
  });
});
