import { Injectable, Logger, Inject } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';

interface ThrottlerStorageRecord {
    totalHits: number;
    timeToExpire: number;
}

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
    private logger = new Logger(RedisThrottlerStorage.name);

    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
        this.redis.on('error', (err) => {
            this.logger.error('[Redis] Storage error:', err.message);
            // DON'T THROW - Fail silently để app không crash
        });
    }

    async increment(key: string): Promise<ThrottlerStorageRecord> {
        try {
            const result = await this.redis.get(key);
            const ttl = await this.redis.pttl(key);

            if (result) {
                await this.redis.incr(key);
                return { totalHits: parseInt(result) + 1, timeToExpire: Math.floor(ttl / 1000) };
            } else {
                await this.redis.setex(key, 60, 1); // Default TTL 60s if not specified
                return { totalHits: 1, timeToExpire: 60 };
            }
        } catch (error) {
            this.logger.warn('[Redis] Fail-open: returning unlimited hits due to error');
            // Fail-open: Cho phép unlimited khi Redis lỗi
            return { totalHits: 0, timeToExpire: 60 };
        }
    }

    async decrement(key: string): Promise<void> {
        try {
            await this.redis.decr(key);
        } catch {
            // Ignore
        }
    }

    async resetKey(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch {
            // Ignore
        }
    }
}
