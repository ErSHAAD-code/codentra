import cookieParser from 'cookie-parser';
import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { StructuredLogger } from '@/common/logger/structured-logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true, bufferLogs: true }); // required for WebhooksController's HMAC verification
  app.useLogger(await app.resolve(StructuredLogger));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'],
        },
      },
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: [process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  });

  // Global versioning: every route is served under /api/v1/*
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1');

  // Strips unknown properties and rejects requests that don't match DTOs —
  // this is the app's primary input-validation boundary.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.BACKEND_PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Codentra API running on http://localhost:${port}/${process.env.API_PREFIX ?? 'api/v1'}`);
}

bootstrap();
