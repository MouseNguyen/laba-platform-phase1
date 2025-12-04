import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    async get(key: string): Promise<string | null> {
        try {
            return await this.redis.get(key);
        } catch (error) {
            this.logger.error(`Failed to get key ${key}: ${(error as Error).message}`);
            return null;
        }
    }

    async set(key: string, value: string): Promise<void> {
        try {
            await this.redis.set(key, value);
        } catch (error) {
            this.logger.error(`Failed to set key ${key}: ${(error as Error).message}`);
        }
    }

    async setex(key: string, seconds: number, value: string): Promise<void> {
        try {
            await this.redis.setex(key, seconds, value);
        } catch (error) {
            this.logger.error(`Failed to setex key ${key}: ${(error as Error).message}`);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            this.logger.error(`Failed to delete key ${key}: ${(error as Error).message}`);
        }
    }

    async keys(pattern: string): Promise<string[]> {
        try {
            return await this.redis.keys(pattern);
        } catch (error) {
            this.logger.error(`Failed to get keys for pattern ${pattern}: ${(error as Error).message}`);
            return [];
        }
    }

    // Helper to delete keys by pattern (useful for cache invalidation)
    async delByPattern(pattern: string): Promise<void> {
        try {
            const keys = await this.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.log(`Deleted ${keys.length} keys matching ${pattern}`);
            }
        } catch (error) {
            this.logger.error(`Failed to delete keys by pattern ${pattern}: ${(error as Error).message}`);
        }
    }
}
