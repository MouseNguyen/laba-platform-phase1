import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: (config: ConfigService) => {
                return new Redis({
                    host: config.get('REDIS_HOST'),
                    port: config.get('REDIS_PORT'),
                    password: config.get('REDIS_PASSWORD'),
                    db: config.get('REDIS_DB'),
                    connectTimeout: config.get('REDIS_TIMEOUT_MS'),
                    retryStrategy: (times) => Math.min(times * 50, 2000),
                    reconnectOnError: (err) => {
                        console.error('[Redis] Connection error:', err.message);
                        return true; // Auto reconnect
                    },
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
