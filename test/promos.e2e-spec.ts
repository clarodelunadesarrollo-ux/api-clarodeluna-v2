import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Promos (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userIds: string[] = [];
  const promoIds: string[] = [];

  const uniqueEmail = (tag: string): string =>
    `e2e_promos_${tag}_${Date.now()}_${Math.floor(Math.random() * 1000)}@e2e.test`;

  const issueUser = async (
    tag: string,
  ): Promise<{ token: string; userId: string }> => {
    const email = uniqueEmail(tag);
    const otpRequest = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(200);
    const otp = otpRequest.body.data.otp as string;

    const validate = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/validate')
      .send({ email, otp })
      .expect(200);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Test user was not created by the OTP flow');
    }
    userIds.push(user.id);
    return { token: validate.body.data.accessToken as string, userId: user.id };
  };

  const promoteToAdmin = async (userId: string): Promise<void> => {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });
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
    for (const id of promoIds) {
      await prisma.promoCard.deleteMany({ where: { id } });
    }
    for (const id of userIds) {
      await prisma.otpCode.deleteMany({ where: { userId: id } });
      await prisma.user.deleteMany({ where: { id } });
    }
    await app.close();
  });

  describe('GET /promos', () => {
    it('rejects an unauthenticated request (401)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/promos')
        .expect(401);
      expect(response.body).toMatchObject({ success: false, statusCode: 401 });
    });

    it('returns only active promos for an authenticated user', async () => {
      const { token } = await issueUser('list');

      const active = await prisma.promoCard.create({
        data: {
          title: `E2E Activa ${Date.now()}`,
          subtitle: 'Se muestra',
          icon: 'restaurant',
          order: 1,
          active: true,
        },
      });
      promoIds.push(active.id);
      const inactive = await prisma.promoCard.create({
        data: {
          title: `E2E Inactiva ${Date.now()}`,
          subtitle: 'No se muestra',
          order: 2,
          active: false,
        },
      });
      promoIds.push(inactive.id);

      const response = await request(app.getHttpServer())
        .get('/api/v1/promos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const ids = (response.body.data.promos as { id: string }[]).map(
        (p) => p.id,
      );
      expect(ids).toContain(active.id);
      expect(ids).not.toContain(inactive.id);
    });
  });

  describe('admin CRUD', () => {
    let adminToken: string;

    beforeAll(async () => {
      const admin = await issueUser('admin');
      await promoteToAdmin(admin.userId);
      adminToken = admin.token;
    });

    it('forbids a non-admin from creating a promo (403)', async () => {
      const { token } = await issueUser('client');
      await request(app.getHttpServer())
        .post('/api/v1/promos/admin')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'No permitido', subtitle: 'x' })
        .expect(403);
    });

    it('creates, lists, updates (deactivates) and deletes a promo', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/promos/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `E2E Promo ${Date.now()}`,
          subtitle: 'Descripción',
          icon: 'wine_bar',
          order: 5,
        })
        .expect(201);
      const promoId = created.body.data.id as string;
      promoIds.push(promoId);
      expect(created.body.data).toMatchObject({
        icon: 'wine_bar',
        order: 5,
        active: true,
      });

      // The admin list includes it.
      const adminList = await request(app.getHttpServer())
        .get('/api/v1/promos/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const adminIds = (adminList.body.data as { id: string }[]).map(
        (p) => p.id,
      );
      expect(adminIds).toContain(promoId);

      // Deactivate it.
      await request(app.getHttpServer())
        .patch(`/api/v1/promos/admin/${promoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: false })
        .expect(200);

      // It disappears from the guest list but stays in the admin list.
      const guest = await issueUser('guest');
      const guestList = await request(app.getHttpServer())
        .get('/api/v1/promos')
        .set('Authorization', `Bearer ${guest.token}`)
        .expect(200);
      const guestIds = (guestList.body.data.promos as { id: string }[]).map(
        (p) => p.id,
      );
      expect(guestIds).not.toContain(promoId);

      await request(app.getHttpServer())
        .delete(`/api/v1/promos/admin/${promoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('rejects a promo with an empty title (400 DTO)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/promos/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '', subtitle: 'x' })
        .expect(400);
    });
  });
});
