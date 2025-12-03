import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { Request } from 'express';
import { SecurityLoggerService } from '../common/security-logger.service';
import { PrismaService } from '../prisma/prisma.service';

const MAX_TRACKED_IPS = 50000;

@Injectable()
export class AuthRateLimitService {
    private readonly logger = new Logger(AuthRateLimitService.name);

    // In-memory stores
    private readonly loginByUser = new Map<string, { count: number; windowStart: number }>();
    private readonly loginByIp = new Map<string, { count: number; windowStart: number }>();
    private readonly registerByIp = new Map<string, { count: number; windowStart: number }>();
    private readonly refreshLimitStore = new Map<string, { count: number; resetAt: number }>();

    constructor(
        private readonly config: ConfigService,
        private readonly securityLogger: SecurityLoggerService,
        private readonly prisma: PrismaService,
    ) { }

    async checkConcurrentSessions(userId: number): Promise<void> {
        const limit = this.config.get<number>('MAX_CONCURRENT_SESSIONS_PER_USER') ?? 5;
        const activeTokens = await this.prisma.userToken.count({
            where: {
                user_id: userId,
                revoked_at: null,
                expires_at: { gt: new Date() }
            }
        });

        if (activeTokens >= limit) {
            // Xóa token cũ nhất
            const oldestToken = await this.prisma.userToken.findFirst({
                where: { user_id: userId, revoked_at: null },
                orderBy: { created_at: 'asc' }
            });

            if (oldestToken) {
                await this.prisma.userToken.update({
                    where: { id: oldestToken.id },
                    data: { revoked_at: new Date() }
                });
                this.logger.log(`Revoked oldest token for user ${userId} due to session limit`);
            }
        }
    }

    async checkLoginLimit(email: string, ip: string): Promise<void> {
        const perUserLimit = this.config.get<number>('RATE_LIMIT_LOGIN_PER_USER') ?? 5;
        const perIpLimit = this.config.get<number>('RATE_LIMIT_LOGIN_PER_IP') ?? 10;
        const windowMs = 60_000; // 1 minute

        this.touchCounter(this.loginByUser, email.toLowerCase(), perUserLimit, windowMs, 'login_user');
        this.touchCounter(this.loginByIp, ip, perIpLimit, windowMs, 'login_ip');
    }

    async checkRegisterLimit(ip: string): Promise<void> {
        const limit = this.config.get<number>('RATE_LIMIT_REGISTER_PER_IP') ?? 3;
        const windowMs = 60_000;

        this.touchCounter(this.registerByIp, ip, limit, windowMs, 'register_ip');
    }

    async checkRefreshLimit(ip: string): Promise<void> {
        const now = Date.now();
        const durationMs = (this.config.get<number>('RATE_LIMIT_REFRESH_DURATION_MINUTES') ?? 5) * 60 * 1000;
        const maxRequests = this.config.get<number>('RATE_LIMIT_REFRESH_PER_IP') ?? 10;

        const record = this.refreshLimitStore.get(ip);

        if (!record || now >= record.resetAt) {
            // Memory safety check before adding new record
            if (this.refreshLimitStore.size >= MAX_TRACKED_IPS) {
                // Emergency cleanup: Remove expired entries
                this.cleanupRefreshLimitStore();

                // If still full, remove 20% oldest (by resetAt)
                if (this.refreshLimitStore.size >= MAX_TRACKED_IPS) {
                    const entries = Array.from(this.refreshLimitStore.entries());
                    const toDelete = entries
                        .filter(([, r]) => now - r.resetAt > 0) // Expired
                        .slice(0, Math.floor(MAX_TRACKED_IPS * 0.2));

                    for (const [key] of toDelete) {
                        this.refreshLimitStore.delete(key);
                    }

                    if (this.refreshLimitStore.size >= MAX_TRACKED_IPS) {
                        this.logger.warn(`[SECURITY] RefreshLimitStore reached MAX_TRACKED_IPS, emergency cleanup performed`);
                    }
                }
            }

            // Reset/Set counter
            this.refreshLimitStore.set(ip, { count: 1, resetAt: now + durationMs });
            return;
        }

        if (record.count >= maxRequests) {
            const retryAfter = Math.ceil((record.resetAt - now) / 1000);

            this.securityLogger.logRefreshLimitExceeded(ip, record.count);

            throw new HttpException({
                message: 'Too many refresh attempts',
                code: 'AUTH_REFRESH_LIMIT_EXCEEDED',
                retryAfter,
            }, HttpStatus.TOO_MANY_REQUESTS);
        }

        record.count++;
    }

    getClientIp(req: Request): string {
        // Trust proxy is configured in main.ts, so req.ip should be correct
        return req.ip || req.connection.remoteAddress || 'unknown';
    }

    @Interval(60000) // Run every minute
    private cleanupRefreshLimitStore() {
        const now = Date.now();
        for (const [ip, record] of this.refreshLimitStore.entries()) {
            if (now >= record.resetAt) {
                this.refreshLimitStore.delete(ip);
            }
        }
    }

    private touchCounter(
        store: Map<string, { count: number; windowStart: number }>,
        key: string,
        limit: number,
        windowMs: number,
        context: string,
    ) {
        const now = Date.now();
        const current = store.get(key);

        if (!current || now - current.windowStart > windowMs) {
            // reset window
            store.set(key, { count: 1, windowStart: now });
            return;
        }

        current.count += 1;

        if (current.count > limit) {
            this.logger.warn(`AUTH_RATE_LIMITED_${context.toUpperCase()}`, { key, limit, windowMs });
            throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
        }
    }
}
