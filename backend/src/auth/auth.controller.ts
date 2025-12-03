import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { AuthRateLimitService } from './auth-rate-limit.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private authRateLimitService: AuthRateLimitService,
    ) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
        const ip = this.authService.getClientIp(req);
        await this.authRateLimitService.checkRegisterLimit(ip);
        return this.authService.register(registerDto);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const ip = this.authService.getClientIp(req);
        await this.authRateLimitService.checkLoginLimit(loginDto.email, ip);
        return this.authService.login(loginDto, req, res, ip);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 10, ttl: 300000 } })
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const ip = this.authRateLimitService.getClientIp(req);
        await this.authRateLimitService.checkRefreshLimit(ip);
        return this.authService.refresh(req, res);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.logout(req, res);
    }

    @UseGuards(JwtAuthGuard)
    @Post('revoke-all')
    @HttpCode(HttpStatus.OK)
    async revokeAll(@Req() req, @Res({ passthrough: true }) res: Response) {
        // req.user được populate bởi JwtAuthGuard
        const userId = req.user.id;

        // Xóa cookie của request hiện tại
        res.clearCookie('refresh_token');

        return this.authService.revokeAll(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req) {
        return req.user;
    }
}
