import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { HelmetOptions } from 'helmet';
import helmet from 'helmet';

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
        hsts: isProduction ? { // Chỉ bật HSTS ở production
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        } : false,
        ieNoOpen: true,
        noSniff: true, // X-Content-Type-Options
        originAgentCluster: true,
        referrerPolicy: { policy: 'no-referrer' },
        xssFilter: true,
    };

    app.use(helmet(helmetOptions));

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

    const port = configService.get<number>('PORT') || 3000;
    const nodeEnv = configService.get<string>('NODE_ENV');

    await app.listen(port);

    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Environment: ${nodeEnv}`);
    logger.log(`CORS Origin: ${corsOrigin}`);
}
bootstrap();
