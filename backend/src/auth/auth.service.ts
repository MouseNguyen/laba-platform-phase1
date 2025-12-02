import {
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    UnauthorizedException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';
import { DeviceUtil } from './utils/device.util';
import { SecurityLoggerService } from '../common/security-logger.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly securityLogger: SecurityLoggerService,
    ) { }

    // --- REGISTER ---
    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findOne(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await this.hashPassword(registerDto.password);

        const newUser = await this.usersService.create({
            email: registerDto.email,
            password_hash: hashedPassword,
            full_name: registerDto.fullName,
        });

        const { password_hash, ...result } = newUser;
        return result;
    }

    // --- LOGIN ---
    public getClientIp(req: Request): string {
        const xff = req.headers['x-forwarded-for'];
        if (typeof xff === 'string') {
            return xff.split(',')[0].trim();
        }
        if (Array.isArray(xff)) {
            return xff[0];
        }
        return (req.ip || req.connection.remoteAddress || '').toString();
    }

    async login(loginDto: LoginDto, req: Request, res: Response, ip: string) {
        const user = await this.usersService.findOne(loginDto.email);
        if (!user) {
            // Delay to avoid timing attacks
            await new Promise((resolve) => setTimeout(resolve, 200));
            this.logger.warn('AUTH_LOGIN_FAIL', {
                email: loginDto.email,
                ip,
                reason: 'User not found',
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check lock
        if (user.lock_until && user.lock_until > new Date()) {
            this.logger.warn('AUTH_ACCOUNT_LOCKED', {
                userId: user.id,
                email: user.email,
                lockUntil: user.lock_until,
            });
            throw new HttpException(
                'Account is locked. Please try again later.',
                423,
            );
        }

        const isPasswordValid = await argon2.verify(
            user.password_hash,
            loginDto.password,
        );

        if (!isPasswordValid) {
            await this.handleLoginFailure(user);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Reset lock
        await this.resetLoginLock(user);

        // Generate tokens
        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user, req);

        // Set cookie
        this.setRefreshTokenCookie(res, refreshToken);

        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
            },
        };
    }

    // --- REFRESH ---
    async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }

        // Hash token để tìm trong DB
        const refreshTokenHash = this.hashToken(refreshToken);

        // Tìm token trong DB (kèm user để generate token mới)
        const tokenRecord = await this.prisma.userToken.findUnique({
            where: { refresh_token_hash: refreshTokenHash },
            include: { user: true },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // 1. Reuse Detection
        if (tokenRecord.revoked_at) {
            const detail = {
                userId: tokenRecord.user_id,
                email: tokenRecord.user.email,
                ip: this.getClientIp(req),
                userAgent: req.headers['user-agent'] || 'unknown',
                tokenId: tokenRecord.id,
            };

            this.logger.warn(
                `Token reuse detected for user ${tokenRecord.user_id}`,
            );
            this.securityLogger.logAuthEvent('SESSION_COMPROMISED', detail);
            this.securityLogger.notifyAlertWebhook(
                'SESSION_COMPROMISED',
                detail,
            );

            // Revoke ALL tokens của user này (Kill switch)
            await this.revokeAll(tokenRecord.user_id);

            throw new ForbiddenException({
                message: 'Session compromised. Please login again.',
                code: 'SESSION_COMPROMISED',
            });
        }

        // 2. Check Expiry
        if (new Date() > tokenRecord.expires_at) {
            throw new UnauthorizedException('Refresh token expired');
        }

        // 3. Check device hash (warning only, không chặn)
        const currentDeviceHash = DeviceUtil.getDeviceHash(req);
        if (currentDeviceHash !== tokenRecord.device_hash) {
            this.logger.warn(
                `Device mismatch for user ${tokenRecord.user_id}. Old: ${tokenRecord.device_hash}, New: ${currentDeviceHash}`,
            );
        }

        // 4. Rotation: revoke cũ, tạo mới
        await this.prisma.userToken.update({
            where: { id: tokenRecord.id },
            data: { revoked_at: new Date() },
        });

        const newAccessToken = await this.generateAccessToken(tokenRecord.user);
        const newRefreshToken = await this.generateRefreshToken(
            tokenRecord.user,
            req,
        );

        // Set cookie mới
        this.setRefreshTokenCookie(res, newRefreshToken);

        return {
            access_token: newAccessToken,
        };
    }

    // --- LOGOUT ---
    async logout(req: Request, res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (refreshToken) {
            const refreshTokenHash = this.hashToken(refreshToken);
            // Tìm và revoke (best effort)
            try {
                const tokenRecord = await this.prisma.userToken.findUnique({
                    where: { refresh_token_hash: refreshTokenHash },
                });

                if (tokenRecord) {
                    await this.prisma.userToken.update({
                        where: { id: tokenRecord.id },
                        data: { revoked_at: new Date() },
                    });
                }
            } catch (e) {
                this.logger.error('Logout error', e as any);
            }
        }

        // Clear cookie
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return { message: 'Logged out successfully' };
    }

    // --- REVOKE ALL ---
    async revokeAll(userId: number) {
        // 1. Tăng token version của user (kill-switch cho access token)
        await this.prisma.user.update({
            where: { id: userId },
            data: { token_version: { increment: 1 } },
        });

        // 2. Revoke tất cả refresh tokens còn sống
        await this.prisma.userToken.updateMany({
            where: {
                user_id: userId,
                revoked_at: null,
            },
            data: { revoked_at: new Date() },
        });

        return { message: 'All sessions revoked' };
    }

    // --- HELPERS ---

    private async generateAccessToken(user: User): Promise<string> {
        const payload = {
            sub: user.id,
            email: user.email,
            ver: user.token_version,
        };

        const expiresIn =
            Number(this.configService.get('JWT_ACCESS_EXPIRES_IN')) || 900; // giây

        return this.jwtService.signAsync(payload, {
            expiresIn,
        });
    }

    private async generateRefreshToken(
        user: User,
        req: Request,
    ): Promise<string> {
        // Random string hex
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenHash = this.hashToken(refreshToken);

        // TTL refresh token: ENV (tính bằng GIÂY) hoặc default 7 ngày
        const refreshTtlSeconds =
            Number(this.configService.get('JWT_REFRESH_EXPIRES_IN')) ||
            7 * 24 * 60 * 60; // 7 ngày

        const expiresAt = new Date(Date.now() + refreshTtlSeconds * 1000);

        const deviceHash = DeviceUtil.getDeviceHash(req);
        const deviceInfo = DeviceUtil.getDeviceInfo(req);

        // Lưu vào DB
        await this.prisma.userToken.create({
            data: {
                user_id: user.id,
                refresh_token_hash: refreshTokenHash,
                device_hash: deviceHash,
                device_info: deviceInfo as any, // JSON
                expires_at: expiresAt,
            },
        });

        return refreshToken;
    }

    private setRefreshTokenCookie(res: Response, token: string) {
        // Dùng cùng TTL với refresh token (tính bằng GIÂY)
        const refreshTtlSeconds =
            Number(this.configService.get('JWT_REFRESH_EXPIRES_IN')) ||
            7 * 24 * 60 * 60; // 7 ngày

        const maxAgeMs = refreshTtlSeconds * 1000;

        res.cookie('refresh_token', token, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: maxAgeMs, // number → đúng type CookieOptions
        });
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    private async hashPassword(password: string): Promise<string> {
        const memoryCost =
            Number(this.configService.get('ARGON2_MEMORY_COST')) || 19456;
        const timeCost =
            Number(this.configService.get('ARGON2_TIME_COST')) || 2;
        const parallelism =
            Number(this.configService.get('ARGON2_PARALLELISM')) || 1;

        return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost,
            timeCost,
            parallelism,
        });
    }

    private async handleLoginFailure(user: User): Promise<void> {
        const now = new Date();

        const threshold =
            this.configService.get<number>('ACCOUNT_LOCK_THRESHOLD') ?? 5;
        const baseLockMin =
            this.configService.get<number>('ACCOUNT_LOCK_DURATION_MIN') ?? 15;

        const lastFailed = user.last_failed_attempt;
        let failedCount = user.failed_login_attempts ?? 0;

        const windowMs = baseLockMin * 60_000;

        if (!lastFailed || now.getTime() - lastFailed.getTime() > windowMs) {
            // quá lâu không sai, reset counter
            failedCount = 1;
        } else {
            failedCount += 1;
        }

        let lockUntil: Date | null = user.lock_until ?? null;

        if (failedCount >= threshold) {
            // Gradual lock
            const multiplier = Math.min(3, Math.floor(failedCount / threshold));
            const lockMinutes = baseLockMin * multiplier;
            lockUntil = new Date(now.getTime() + lockMinutes * 60_000);

            this.logger.warn('AUTH_ACCOUNT_LOCKED', {
                userId: user.id,
                email: user.email,
                failedCount,
                lockUntil,
                lockMinutes,
            });
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failed_login_attempts: failedCount,
                last_failed_attempt: now,
                lock_until: lockUntil,
                updated_at: now,
            },
        });

        this.logger.warn('AUTH_LOGIN_FAIL', {
            userId: user.id,
            email: user.email,
            failedCount,
            lockUntil,
        });
    }

    private async resetLoginLock(user: User): Promise<void> {
        if (
            !user.failed_login_attempts &&
            !user.lock_until &&
            !user.last_failed_attempt
        ) {
            return;
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failed_login_attempts: 0,
                lock_until: null,
                last_failed_attempt: null,
                updated_at: new Date(),
            },
        });
    }
}