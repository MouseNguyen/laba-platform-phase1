import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthRateLimitService {
    private readonly logger = new Logger(AuthRateLimitService.name);

    // In-memory stores
    private readonly loginByUser = new Map<string, { count: number; windowStart: number }>();
    private readonly loginByIp = new Map<string, { count: number; windowStart: number }>();
    private readonly registerByIp = new Map<string, { count: number; windowStart: number }>();

    constructor(private readonly config: ConfigService) { }

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
