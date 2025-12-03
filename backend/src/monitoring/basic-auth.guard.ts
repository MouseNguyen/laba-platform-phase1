import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
    constructor(private config: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization;

        if (!auth || !auth.startsWith('Basic ')) {
            throw new UnauthorizedException();
        }

        const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        const validUser = this.config.get('METRICS_USER');
        const validPass = this.config.get('METRICS_PASS');

        if (username !== validUser || password !== validPass) {
            throw new UnauthorizedException();
        }

        return true;
    }
}
