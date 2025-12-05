import { join } from 'path';

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { HelmetOptions } from 'helmet';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // QUAN TRỌNG: Trust proxy (cho rate limit hoạt động sau Load Balancer/Nginx)
  app.set('trust proxy', 1);

  // Helmet config (Phase 1 - Basic, không CSP)
  const isProduction = process.env.NODE_ENV === 'production';
  const helmetOptions: HelmetOptions = {
    contentSecurityPolicy: false, // Tắt CSP phức tạp, để Phase 2
    crossOriginEmbedderPolicy: false, // Tránh xung đột với Next.js
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    hidePoweredBy: true,
    hsts: isProduction
      ? {
        // Chỉ bật HSTS ở production
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
      : false,
    ieNoOpen: true,
    noSniff: true, // X-Content-Type-Options
    originAgentCluster: true,
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
  };

  app.use(helmet(helmetOptions));

  // Static files for uploads (before global prefix)
  const uploadsPath = join(__dirname, '..', 'uploads');
  logger.log(`Serving uploads from: ${uploadsPath}`);
  app.use('/uploads', express.static(uploadsPath));

  // Cookie Parser
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  app.use(cookieParser(cookieSecret));

  // Enable CORS
  // CORS config (giữ nguyên)
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin || 'http://localhost:3001',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API Versioning & Prefix
  app.setGlobalPrefix('api', {
    exclude: ['uploads/:filename', 'uploads/(.*)'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV');

  // Swagger Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Laba Platform API')
    .setDescription('API documentation for Laba Platform - Farm, Homestay, Cafe management')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('branches', 'Branch management endpoints')
    .addTag('posts', 'CMS Post endpoints')
    .addTag('users', 'User management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  logger.log('Swagger UI available at: /api/docs');

  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(`CORS Origin: ${corsOrigin}`);
}
bootstrap();
