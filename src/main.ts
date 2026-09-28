import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');

  // Raised from the 100kb default so full-content backup imports fit in one body.
  app.useBodyParser('json', { limit: '25mb' });

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

  // CORS is permissive for the DEV phase; tighten the origin allowlist before any shared/prod deploy.
  app.enableCors({ origin: true, credentials: true });

  const config = app.get(ConfigService);
  const port = Number(config.get<string>('PORT', '3000'));

  await app.listen(port);
  logger.log(`Claro de Luna API running on port ${port} (prefix /api/v1)`);
}

void bootstrap();
