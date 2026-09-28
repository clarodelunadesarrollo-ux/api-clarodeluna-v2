import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;
const SAMPLE_IMAGE_URL =
  'https://res.cloudinary.com/yjz6pfeh/image/upload/v1790466563/cld-sample-4.jpg';
const SAMPLE_VIDEO_URL =
  'https://res.cloudinary.com/yjz6pfeh/video/upload/w_1280,c_limit,q_auto/v1790466554/samples/cld-sample-video.mp4';

const bogotaToday = (): Date => {
  const bogotaNow = new Date(Date.now() - BOGOTA_OFFSET_MS);
  return new Date(
    Date.UTC(
      bogotaNow.getUTCFullYear(),
      bogotaNow.getUTCMonth(),
      bogotaNow.getUTCDate(),
    ),
  );
};

describe('Huerta (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userIds: string[] = [];
  const itemIds: string[] = [];

  const uniqueEmail = (tag: string): string =>
    `e2e_huerta_${tag}_${Date.now()}_${Math.floor(Math.random() * 1000)}@e2e.test`;

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

  const checkInToday = async (userId: string): Promise<void> => {
    await prisma.reservation.create({
      data: {
        userId,
        type: 'TOUR',
        date: bogotaToday(),
        time: '12:00',
        partySize: 2,
        holderName: 'E2E Huerta',
        status: 'CHECKED_IN',
      },
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
    for (const id of itemIds) {
      await prisma.huertaItem.deleteMany({ where: { id } });
    }
    for (const id of userIds) {
      await prisma.reservation.deleteMany({ where: { userId: id } });
      await prisma.otpCode.deleteMany({ where: { userId: id } });
      await prisma.user.deleteMany({ where: { id } });
    }
    await app.close();
  });

  describe('GET /huerta', () => {
    it('rejects an unauthenticated request (401)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/huerta')
        .expect(401);
      expect(response.body).toMatchObject({ success: false, statusCode: 401 });
    });

    it('returns 403 when the user has no check-in today', async () => {
      const { token } = await issueUser('nocontext');
      const response = await request(app.getHttpServer())
        .get('/api/v1/huerta')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      expect(response.body).toMatchObject({ success: false, statusCode: 403 });
    });

    it('returns the active items after a check-in (200)', async () => {
      const { token, userId } = await issueUser('checkedin');
      await checkInToday(userId);
      const item = await prisma.huertaItem.create({
        data: {
          type: 'VIDEO',
          title: `E2E Riego ${Date.now()}`,
          description: 'Riego por goteo.',
          mediaUrl: SAMPLE_VIDEO_URL,
          posterUrl: SAMPLE_IMAGE_URL,
          order: 1,
          active: true,
        },
      });
      itemIds.push(item.id);

      const response = await request(app.getHttpServer())
        .get('/api/v1/huerta')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const found = response.body.data.items.find(
        (i: { id: string }) => i.id === item.id,
      );
      expect(found).toMatchObject({
        type: 'VIDEO',
        mediaUrl: SAMPLE_VIDEO_URL,
        posterUrl: SAMPLE_IMAGE_URL,
      });
    });
  });

  describe('admin CRUD', () => {
    let adminToken: string;

    beforeAll(async () => {
      const admin = await issueUser('admin');
      await promoteToAdmin(admin.userId);
      adminToken = admin.token;
    });

    it('forbids a non-admin from creating an item (403)', async () => {
      const { token } = await issueUser('client');
      await request(app.getHttpServer())
        .post('/api/v1/huerta/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'IMAGE',
          title: 'No permitido',
          mediaUrl: SAMPLE_IMAGE_URL,
          order: 1,
        })
        .expect(403);
    });

    it('creates, lists, updates and deletes an IMAGE item', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/huerta/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'IMAGE',
          title: `E2E Item ${Date.now()}`,
          mediaUrl: SAMPLE_IMAGE_URL,
          order: 1,
        })
        .expect(201);
      const itemId = created.body.data.id as string;
      itemIds.push(itemId);
      expect(created.body.data.posterUrl).toBeNull();

      // The admin list includes it (active and inactive alike).
      const adminList = await request(app.getHttpServer())
        .get('/api/v1/huerta/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const adminIds = (adminList.body.data as { id: string }[]).map(
        (i) => i.id,
      );
      expect(adminIds).toContain(itemId);

      await request(app.getHttpServer())
        .patch(`/api/v1/huerta/items/${itemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'E2E Item actualizado' })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/v1/huerta/items/${itemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('rejects a VIDEO item without a poster (400 DTO)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/huerta/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'VIDEO',
          title: 'Sin poster',
          mediaUrl: SAMPLE_VIDEO_URL,
          order: 1,
        })
        .expect(400);
    });

    it('rejects an invalid media url (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/huerta/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'IMAGE', title: 'Bad', mediaUrl: 'not-a-url', order: 1 })
        .expect(400);
    });

    it('returns 404 when updating a missing item', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/huerta/items/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Nope' })
        .expect(404);
    });
  });
});
