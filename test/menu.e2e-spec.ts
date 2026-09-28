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

// UTC-midnight of the current Bogota day, matching how BogotaClock.today()
// and Prisma `@db.Date` round-trip reservation dates.
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

describe('Menu (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userIds: string[] = [];
  const sectionIds: string[] = [];

  const uniqueEmail = (tag: string): string =>
    `e2e_menu_${tag}_${Date.now()}_${Math.floor(Math.random() * 1000)}@e2e.test`;

  // Issues a token and returns the created user id.
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

  const checkInToday = async (
    userId: string,
    type: 'TOUR' | 'RESTAURANT',
  ): Promise<void> => {
    await prisma.reservation.create({
      data: {
        userId,
        type,
        date: bogotaToday(),
        time: '12:00',
        partySize: 2,
        holderName: 'E2E Menu',
        status: 'CHECKED_IN',
      },
    });
  };

  const createSection = async (
    type: 'TOUR' | 'RESTAURANT',
    title: string,
  ): Promise<string> => {
    const section = await prisma.menuSection.create({
      data: { menuType: type, title, order: 1, active: true },
    });
    sectionIds.push(section.id);
    return section.id;
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
    for (const id of sectionIds) {
      await prisma.menuSection.deleteMany({ where: { id } });
    }
    for (const id of userIds) {
      await prisma.reservation.deleteMany({ where: { userId: id } });
      await prisma.otpCode.deleteMany({ where: { userId: id } });
      await prisma.user.deleteMany({ where: { id } });
    }
    await app.close();
  });

  describe('GET /menu', () => {
    it('rejects an unauthenticated request (401)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/menu')
        .expect(401);
      expect(response.body).toMatchObject({ success: false, statusCode: 401 });
    });

    it('returns 403 when the user has no check-in today', async () => {
      const { token } = await issueUser('nocontext');
      const response = await request(app.getHttpServer())
        .get('/api/v1/menu')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      expect(response.body).toMatchObject({ success: false, statusCode: 403 });
    });

    it('returns the RESTAURANT menu after a restaurant check-in (200)', async () => {
      const { token, userId } = await issueUser('restaurant');
      await checkInToday(userId, 'RESTAURANT');
      const sectionId = await createSection('RESTAURANT', `E2E Entradas ${Date.now()}`);
      await prisma.menuDish.create({
        data: {
          sectionId,
          name: 'E2E Provoleta',
          description: 'Queso grillado.',
          imageUrl: SAMPLE_IMAGE_URL,
          priceCents: 650000,
          tags: ['Vegetariano'],
          order: 1,
          active: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/menu')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.menuType).toBe('RESTAURANT');
      const section = response.body.data.sections.find(
        (s: { id: string }) => s.id === sectionId,
      );
      expect(section).toBeDefined();
      expect(section.dishes[0]).toMatchObject({
        name: 'E2E Provoleta',
        imageUrl: SAMPLE_IMAGE_URL,
        priceCents: 650000,
        tags: ['Vegetariano'],
      });
    });

    it('returns the TOUR menu after a tour check-in (200)', async () => {
      const { token, userId } = await issueUser('tour');
      await checkInToday(userId, 'TOUR');

      const response = await request(app.getHttpServer())
        .get('/api/v1/menu')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.menuType).toBe('TOUR');
      expect(Array.isArray(response.body.data.sections)).toBe(true);
    });
  });

  describe('admin CRUD', () => {
    let token: string;

    beforeAll(async () => {
      const admin = await issueUser('admin');
      await promoteToAdmin(admin.userId);
      token = admin.token;
    });

    it('forbids a non-admin from creating a section (403)', async () => {
      const { token: clientToken } = await issueUser('client');
      await request(app.getHttpServer())
        .post('/api/v1/menu/sections')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ menuType: 'RESTAURANT', title: 'No permitido', order: 1 })
        .expect(403);
    });

    it('lists all sections with their dishes (200)', async () => {
      const sectionId = await createSection('TOUR', `E2E List ${Date.now()}`);
      await prisma.menuDish.create({
        data: {
          sectionId,
          name: 'E2E List Dish',
          description: 'Descripción.',
          imageUrl: SAMPLE_IMAGE_URL,
          order: 1,
          active: false,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/menu/sections')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const section = response.body.data.find(
        (s: { id: string }) => s.id === sectionId,
      );
      expect(section).toBeDefined();
      // Admin listing includes inactive dishes.
      expect(section.dishes[0]).toMatchObject({
        name: 'E2E List Dish',
        active: false,
      });
    });

    it('creates a section (201) and rejects an empty title (400)', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/menu/sections')
        .set('Authorization', `Bearer ${token}`)
        .send({ menuType: 'RESTAURANT', title: 'E2E Postres', order: 3 })
        .expect(201);
      expect(created.body.data.title).toBe('E2E Postres');
      sectionIds.push(created.body.data.id as string);

      await request(app.getHttpServer())
        .post('/api/v1/menu/sections')
        .set('Authorization', `Bearer ${token}`)
        .send({ menuType: 'RESTAURANT', title: '', order: 3 })
        .expect(400);
    });

    it('creates, updates and deletes a dish; validates inputs', async () => {
      const sectionId = await createSection('RESTAURANT', `E2E CRUD ${Date.now()}`);

      const created = await request(app.getHttpServer())
        .post('/api/v1/menu/dishes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          sectionId,
          name: 'E2E Dish',
          description: 'Descripción.',
          imageUrl: SAMPLE_IMAGE_URL,
          order: 1,
        })
        .expect(201);
      const dishId = created.body.data.id as string;
      expect(created.body.data.priceCents).toBeNull();

      await request(app.getHttpServer())
        .patch(`/api/v1/menu/dishes/${dishId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ priceCents: 999900 })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/v1/menu/dishes/${dishId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('rejects an invalid image url (400)', async () => {
      const sectionId = await createSection('RESTAURANT', `E2E Invalid ${Date.now()}`);
      await request(app.getHttpServer())
        .post('/api/v1/menu/dishes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          sectionId,
          name: 'Bad',
          description: 'Descripción.',
          imageUrl: 'not-a-url',
          order: 1,
        })
        .expect(400);
    });

    it('returns 404 when creating a dish for a missing section', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/menu/dishes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          sectionId: '00000000-0000-0000-0000-000000000000',
          name: 'Ghost',
          description: 'Descripción.',
          imageUrl: SAMPLE_IMAGE_URL,
          order: 1,
        })
        .expect(404);
    });

    it('returns 404 when updating a missing dish', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/menu/dishes/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nope' })
        .expect(404);
    });
  });
});
