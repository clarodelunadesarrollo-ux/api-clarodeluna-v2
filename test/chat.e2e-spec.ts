import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Chat (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userIds: string[] = [];
  const conversationIds: string[] = [];

  const uniqueEmail = (tag: string): string =>
    `e2e_chat_${tag}_${Date.now()}_${Math.floor(Math.random() * 1000)}@e2e.test`;

  const issueUser = async (
    tag: string,
  ): Promise<{ token: string; userId: string }> => {
    const email = uniqueEmail(tag);
    const otpRequest = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ email })
      .expect(200);
    const otp = otpRequest.body.data.otp as string;

    const validated = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/validate')
      .send({ email, otp })
      .expect(200);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Test user was not created by the OTP flow');
    }
    userIds.push(user.id);
    return {
      token: validated.body.data.accessToken as string,
      userId: user.id,
    };
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
    await prisma.message.deleteMany({
      where: {
        OR: [
          { conversationId: { in: conversationIds } },
          { senderId: { in: userIds } },
        ],
      },
    });
    await prisma.conversation.deleteMany({
      where: { id: { in: conversationIds } },
    });
    await prisma.otpCode.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.reservation.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  it('rejects an unauthenticated request (401)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/chat/conversation')
      .expect(401);
    expect(response.body).toMatchObject({ success: false, statusCode: 401 });
  });

  it('runs the full client + admin conversation flow', async () => {
    const client = await issueUser('client');
    const admin = await issueUser('admin');
    await promoteToAdmin(admin.userId);

    // Client gets (creates) its conversation, empty and unread-free.
    const conversationRes = await request(app.getHttpServer())
      .get('/api/v1/chat/conversation')
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);
    const conversationId = conversationRes.body.data.id as string;
    conversationIds.push(conversationId);
    expect(conversationRes.body.data.unreadCount).toBe(0);

    // Client sends a text message.
    const sent = await request(app.getHttpServer())
      .post('/api/v1/chat/conversation/messages')
      .set('Authorization', `Bearer ${client.token}`)
      .send({ body: '  Hola, necesito ayuda  ' })
      .expect(201);
    expect(sent.body.data).toMatchObject({
      senderType: 'CLIENT',
      type: 'TEXT',
      body: 'Hola, necesito ayuda',
    });

    // Empty body is rejected (400).
    await request(app.getHttpServer())
      .post('/api/v1/chat/conversation/messages')
      .set('Authorization', `Bearer ${client.token}`)
      .send({ body: '   ' })
      .expect(400);

    // A non-admin cannot reach the admin inbox (403).
    await request(app.getHttpServer())
      .get('/api/v1/chat/admin/conversations')
      .set('Authorization', `Bearer ${client.token}`)
      .expect(403);

    // The admin sees the conversation with 1 unread client message.
    const inbox = await request(app.getHttpServer())
      .get('/api/v1/chat/admin/conversations')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const summary = (
      inbox.body.data.conversations as Array<{
        id: string;
        unreadCount: number;
      }>
    ).find((c) => c.id === conversationId);
    expect(summary).toBeDefined();
    expect(summary?.unreadCount).toBe(1);

    // The admin replies.
    await request(app.getHttpServer())
      .post(`/api/v1/chat/admin/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ body: 'Hola, contanos qué necesitás' })
      .expect(201);

    // The client now has 1 unread ADMIN message.
    const unread = await request(app.getHttpServer())
      .get('/api/v1/chat/unread-count')
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);
    expect(unread.body.data.count).toBe(1);

    // The client sees both messages in order.
    const messages = await request(app.getHttpServer())
      .get('/api/v1/chat/conversation/messages')
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);
    const list = messages.body.data.messages as Array<{ senderType: string }>;
    expect(list).toHaveLength(2);
    expect(list[0].senderType).toBe('CLIENT');
    expect(list[1].senderType).toBe('ADMIN');

    // The client marks the conversation as read; the badge clears.
    await request(app.getHttpServer())
      .post('/api/v1/chat/conversation/read')
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);
    const clearedUnread = await request(app.getHttpServer())
      .get('/api/v1/chat/unread-count')
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);
    expect(clearedUnread.body.data.count).toBe(0);
  });
});
