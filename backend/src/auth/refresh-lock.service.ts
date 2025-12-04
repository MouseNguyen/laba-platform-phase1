import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class RefreshLockService {
    private readonly logger = new Logger(RefreshLockService.name);

    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    async acquireLock(userId: number, ttlMs: number = 500): Promise<boolean> {
        // Temporarily disabled for debugging - always allow refresh
        return true;

        const key = `refresh_lock:${userId}`;
        const value = crypto.randomUUID();

        try {
            const result = await this.redis.set(key, value, 'PX', ttlMs, 'NX');
            return result === 'OK';
        } catch (error) {
            this.logger.warn(`[Lock] Fail-open: Could not acquire lock for user ${userId}`, error.message);
            return true; // FAIL OPEN: Cho phép refresh nếu Redis lỗi
        }
    }

    async releaseLock(userId: number): Promise<void> {
        const key = `refresh_lock:${userId}`;
        try {
            await this.redis.del(key);
        } catch {
            // Ignore, key sẽ tự expire
        }
    }
}
