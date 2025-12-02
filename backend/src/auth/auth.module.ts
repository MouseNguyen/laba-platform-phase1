import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthRateLimitService } from './auth-rate-limit.service';
import { TokenCleanupService } from './token-cleanup.service';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService): JwtModuleOptions => {
                // Lấy TTL access token từ ENV (giây), nếu không có thì default = 900s (15 phút)
                const accessTokenExpiresIn =
                    Number(configService.get('JWT_ACCESS_EXPIRES_IN')) || 900;

                return {
                    secret: configService.get<string>('JWT_ACCESS_SECRET')!,
                    signOptions: {
                        expiresIn: accessTokenExpiresIn,
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, AuthRateLimitService, TokenCleanupService],
})
export class AuthModule { }