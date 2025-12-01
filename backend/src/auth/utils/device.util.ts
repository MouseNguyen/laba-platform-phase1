import { Request } from 'express';
import * as crypto from 'crypto';

export class DeviceUtil {
    static getDeviceInfo(req: Request) {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const ip = DeviceUtil.extractIp(req);

        return {
            userAgent,
            ip,
            os: 'unknown', // Có thể dùng lib user-agent parser nếu cần chi tiết hơn
            browser: 'unknown',
        };
    }

    static getDeviceHash(req: Request): string {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const ip = DeviceUtil.extractIp(req);
        const subnet = DeviceUtil.anonymizeIp(ip);

        // Hash: SHA256(User-Agent + IP Subnet)
        return crypto
            .createHash('sha256')
            .update(`${userAgent}|${subnet}`)
            .digest('hex');
    }

    private static extractIp(req: Request): string {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        if (Array.isArray(ip)) {
            ip = ip[0];
        }
        // Handle IPv6 mapped IPv4
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }
        return ip;
    }

    private static anonymizeIp(ip: string): string {
        // Simple subnet masking
        // IPv4: /24 (giữ 3 octet đầu)
        if (ip.includes('.')) {
            const parts = ip.split('.');
            if (parts.length === 4) {
                return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
            }
        }

        // IPv6: /64 (giữ 4 block đầu)
        if (ip.includes(':')) {
            const parts = ip.split(':');
            if (parts.length >= 4) {
                return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
            }
        }

        return ip;
    }
}
