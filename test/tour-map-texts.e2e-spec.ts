import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

const TOUR_MAP_TEXTS_KEY = 'tour.map_texts';

describe('Settings tour map texts (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const emails: string[] = [];
  const uniqueEmail = (tag: string): string => {
    const email = `e2e_tour_map_texts_${tag}_${Date.now()}@e2e.test`;
    emails.push(email);
    return email;
  };

  // Issues a token for a fresh (CLIENT-role) user.
  const issueClientToken = async (): Promise<string> => {
    const email = uniqueEmail('client');
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

    // Remove the key so the GET defaults assertions are deterministic.
    await prisma.appSetting.deleteMany({ where: { key: TOUR_MAP_TEXTS_KEY } });
  });

  afterAll(async () => {
    await prisma.appSetting.deleteMany({ where: { key: TOUR_MAP_TEXTS_KEY } });

    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.otpCode.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    await app.close();
  });

  it('exposes the default texts without authentication (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/settings/tour-map-texts')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Tu recorrido');
    expect(response.body.data.stepLabel).toBe('Parada {order}');
    expect(response.body.data.failureServer).toBe(
      'No pudimos cargar el recorrido. Reintentá.',
    );
  });

  it('rejects updating the texts without a token (401)', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-map-texts')
      .send({ title: 'Hackeado' })
      .expect(401);
  });

  it('rejects updating the texts with a non-admin token (403)', async () => {
    const token = await issueClientToken();

    await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-map-texts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Cliente curioso' })
      .expect(403);
  });

  it('updates the texts as admin and reflects them on read (200)', async () => {
    const token = await issueAdminToken();

    const patch = await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-map-texts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nuestro recorrido', stepLabel: 'Punto {order}' })
      .expect(200);

    expect(patch.body.success).toBe(true);
    expect(patch.body.data.title).toBe('Nuestro recorrido');
    expect(patch.body.data.stepLabel).toBe('Punto {order}');
    // Untouched field keeps its default.
    expect(patch.body.data.retry).toBe('Reintentar');

    const afterPatch = await request(app.getHttpServer())
      .get('/api/v1/settings/tour-map-texts')
      .expect(200);
    expect(afterPatch.body.data.title).toBe('Nuestro recorrido');
    expect(afterPatch.body.data.stepLabel).toBe('Punto {order}');
  });

  it('rejects a stepLabel without the {order} token (400)', async () => {
    const token = await issueAdminToken();

    await request(app.getHttpServer())
      .patch('/api/v1/settings/tour-map-texts')
      .set('Authorization', `Bearer ${token}`)
      .send({ stepLabel: 'Parada' })
      .expect(400);
  });
});
