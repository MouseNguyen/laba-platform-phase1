import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const logger = new Logger('Bootstrap');

    // Cookie Parser
    const cookieSecret = configService.get<string>('COOKIE_SECRET');
    app.use(cookieParser(cookieSecret));

    // Enable CORS
    const corsOrigin = configService.get<string>('CORS_ORIGIN');
    app.enableCors({
        origin: corsOrigin,
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
