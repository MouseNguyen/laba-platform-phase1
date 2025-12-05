import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealthCheck() {
    try {
      // Simple query to check DB connection
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        checks: {
          db: 'up',
        },
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        checks: {
          db: 'down',
        },
        error: error.message,
      });
    }
  }
}
