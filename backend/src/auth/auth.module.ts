import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

import Redis from 'ioredis';

import { MonitoringModule } from '../monitoring/monitoring.module';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';

import { AuthRateLimitService } from './auth-rate-limit.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisThrottlerStorage } from './redis-throttler-storage.service';
import { RefreshLockService } from './refresh-lock.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenCleanupService } from './token-cleanup.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MonitoringModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const accessTokenExpiresIn = Number(configService.get('JWT_ACCESS_EXPIRES_IN')) || 900;

        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET')!,
          signOptions: {
            expiresIn: accessTokenExpiresIn,
          },
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, 'REDIS_CLIENT'],
      useFactory: (config: ConfigService, redis: Redis) => ({
        throttlers: [
          {
            ttl: config.get('RATE_LIMIT_TTL') || 60000,
            limit: config.get('RATE_LIMIT_MAX') || 10,
          },
        ],
        storage: new RedisThrottlerStorage(redis),
        errorMessage: 'Too many requests. Please try again later.',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthRateLimitService,
    TokenCleanupService,
    RefreshLockService,
    RedisThrottlerStorage,
  ],
  exports: [AuthService, RefreshLockService],
})
export class AuthModule { }
