import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import {
    ADMIN_USER_EMAIL,
    ADMIN_USER_NAME,
} from '../src/modules/auth/domain/admin-user';
import { PrismaService } from '../src/prisma/prisma.service';

// Exercises the admin-theme-configuration surface: the service session endpoint
// (Option B) and the preset CRUD. Requires a live database and a valid
// ADMIN_PANEL_KEY in the environment (the app will not boot otherwise).
describe('Admin theme configuration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const emails: string[] = [];
  const createdPresetKeys: string[] = [];
  const panelKey = process.env.ADMIN_PANEL_KEY ?? '';

  const uniqueEmail = (tag: string): string => {
    const email = `e2e_admin_theme_${tag}_${Date.now()}@e2e.test`;
    emails.push(email);
    return email;
  };

  const uniquePresetKey = (): string => {
    const key = `e2e_preset_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    createdPresetKeys.push(key);
    return key;
  };

  const pair = (light: string, dark: string) => ({ light, dark });
  const palettePayload = () => ({
    background: pair('#FAF7F0', '#14110D'),
    surface: pair('#F2ECE0', '#1E1A14'),
    card: pair('#FFFFFF', '#26221B'),
    primary: pair('#6B7A4F', '#A7B487'),
    primaryHover: pair('#5A6842', '#93A072'),
    secondary: pair('#8A9A6B', '#B6C296'),
    accent: pair('#B07D48', '#D6A574'),
    textPrimary: pair('#2C2A24', '#EFEAE0'),
    textSecondary: pair('#5C574C', '#B7B0A2'),
    border: pair('#D9D2C4', '#3A352C'),
  });
  const semanticPayload = () => ({
    success: pair('#2F7D4A', '#73C98A'),
    warning: pair('#B7791F', '#E5B95B'),
    error: pair('#B6403A', '#EE827A'),
    info: pair('#3F7180', '#8FC4D0'),
  });
  const newPresetPayload = (key: string) => ({
    key,
    name: 'Tema E2E',
    description: 'Preset creado por la suite e2e.',
    suggestedUse: 'Solo pruebas.',
    sortOrder: 99,
    palette: palettePayload(),
    semantic: semanticPayload(),
  });

  // Issues a token for a fresh user and promotes it to ADMIN so it passes the
  // RolesGuard on the preset CRUD routes.
  const issueAdminToken = async (): Promise<string> => {
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

    // Ensure the seeded admin account exists for the service-session tests.
    await prisma.user.upsert({
      where: { email: ADMIN_USER_EMAIL },
      create: { email: ADMIN_USER_EMAIL, name: ADMIN_USER_NAME, role: 'ADMIN' },
      update: { name: ADMIN_USER_NAME, role: 'ADMIN' },
    });
  });

  afterAll(async () => {
    for (const key of createdPresetKeys) {
      await prisma.themePreset.deleteMany({ where: { key } });
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

  describe('POST /auth/admin/session', () => {
    it('issues admin tokens for a valid panel key (200)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/admin/session')
        .send({ panelKey })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.accessToken).toBe('string');
      expect(typeof response.body.data.refreshToken).toBe('string');
      expect(response.body.data.tokenType).toBe('Bearer');
    });

    it('rejects an invalid panel key (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/admin/session')
        .send({ panelKey: 'definitely-not-the-panel-key' })
        .expect(401);
    });
  });

  describe('preset CRUD', () => {
    it('rejects creating a preset without a token (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settings/theme/presets')
        .send(newPresetPayload(uniquePresetKey()))
        .expect(401);
    });

    it('creates, updates and deletes a preset with an admin token', async () => {
      const token = await issueAdminToken();
      const key = uniquePresetKey();

      const created = await request(app.getHttpServer())
        .post('/api/v1/settings/theme/presets')
        .set('Authorization', `Bearer ${token}`)
        .send(newPresetPayload(key))
        .expect(201);
      expect(created.body.data.key).toBe(key);
      expect(created.body.data.isDefault).toBe(false);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/settings/theme/presets/${key}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Tema E2E renombrado' })
        .expect(200);
      expect(updated.body.data.name).toBe('Tema E2E renombrado');

      await request(app.getHttpServer())
        .delete(`/api/v1/settings/theme/presets/${key}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('rejects an invalid HEX color on create (400)', async () => {
      const token = await issueAdminToken();
      const payload = newPresetPayload(uniquePresetKey());
      payload.palette.primary = pair('not-a-hex', '#000000');

      await request(app.getHttpServer())
        .post('/api/v1/settings/theme/presets')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(400);
    });

    it('returns 404 when updating an unknown preset (404)', async () => {
      const token = await issueAdminToken();

      await request(app.getHttpServer())
        .patch('/api/v1/settings/theme/presets/does_not_exist')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'X' })
        .expect(404);
    });

    it('rejects deleting the default preset (409)', async () => {
      const token = await issueAdminToken();
      const defaultPreset = await prisma.themePreset.findFirst({
        where: { isDefault: true },
      });
      if (!defaultPreset) {
        // No default preset seeded in this environment; nothing to assert.
        return;
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/settings/theme/presets/${defaultPreset.key}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409);
    });
  });
});
