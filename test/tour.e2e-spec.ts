import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tour stops (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const emails: string[] = [];
  const createdStopIds: string[] = [];

  const uniqueEmail = (tag: string): string => {
    const email = `e2e_tour_${tag}_${Date.now()}@e2e.test`;
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
  // RolesGuard on the write routes.
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

  const newStopPayload = (order: number) => ({
    order,
    title: `Parada ${order}`,
    description: `Descripción de la parada ${order}.`,
    positionX: 0.5,
    positionY: 0.5,
  });

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
    for (const id of createdStopIds) {
      await prisma.tourStop.deleteMany({ where: { id } });
    }
    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.otpCode.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    await app.close();
  });

  it('rejects listing stops without a token (401)', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/tour/stops')
      .expect(401);
  });

  it('lists the seeded stops ordered for an authenticated guest (200)', async () => {
    const token = await issueAccessToken();

    const response = await request(app.getHttpServer())
      .get('/api/v1/tour/stops')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    const stops = response.body.data as Array<{ order: number; active: boolean }>;
    expect(Array.isArray(stops)).toBe(true);
    expect(stops.length).toBeGreaterThanOrEqual(6);
    expect(stops.every((stop) => stop.active)).toBe(true);
    const orders = stops.map((stop) => stop.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('creates, reads, updates and deletes a stop with an admin token', async () => {
    const token = await issueAdminToken();

    const created = await request(app.getHttpServer())
      .post('/api/v1/tour/stops')
      .set('Authorization', `Bearer ${token}`)
      .send(newStopPayload(101))
      .expect(201);

    const stopId = created.body.data.id as string;
    createdStopIds.push(stopId);
    expect(created.body.data.title).toBe('Parada 101');

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/tour/stops/${stopId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(fetched.body.data.id).toBe(stopId);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/tour/stops/${stopId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Parada renombrada' })
      .expect(200);
    expect(updated.body.data.title).toBe('Parada renombrada');

    await request(app.getHttpServer())
      .delete(`/api/v1/tour/stops/${stopId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/v1/tour/stops/${stopId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('rejects creating a stop with a non-admin token (403)', async () => {
    const token = await issueAccessToken();

    await request(app.getHttpServer())
      .post('/api/v1/tour/stops')
      .set('Authorization', `Bearer ${token}`)
      .send(newStopPayload(103))
      .expect(403);
  });

  it('rejects an out-of-range position on create (400)', async () => {
    const token = await issueAdminToken();

    await request(app.getHttpServer())
      .post('/api/v1/tour/stops')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...newStopPayload(102), positionX: 1.5 })
      .expect(400);
  });

  it('returns 404 for an unknown stop id (404)', async () => {
    const token = await issueAccessToken();

    await request(app.getHttpServer())
      .get('/api/v1/tour/stops/99999999-9999-9999-9999-999999999999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
