import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupUserTokens() {
    this.logger.log('Starting user_tokens cleanup job...');
    const start = Date.now();

    const graceDays = this.configService.get<number>('TOKEN_CLEANUP_GRACE_DAYS') ?? 30;
    const batchSize = this.configService.get<number>('TOKEN_CLEANUP_BATCH_SIZE') ?? 100;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - graceDays);

    let totalDeleted = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        // Find tokens to delete (expired OR revoked before cutoff)
        const tokensToDelete = await this.prisma.userToken.findMany({
          where: {
            OR: [{ expires_at: { lt: cutoffDate } }, { revoked_at: { lt: cutoffDate } }],
          },
          select: { id: true },
          take: batchSize,
        });

        if (tokensToDelete.length === 0) {
          hasMore = false;
          break;
        }

        const ids = tokensToDelete.map((t) => t.id);

        // Delete them
        await this.prisma.userToken.deleteMany({
          where: {
            id: { in: ids },
          },
        });

        totalDeleted += tokensToDelete.length;

        // If we fetched less than batchSize, we are done
        if (tokensToDelete.length < batchSize) {
          hasMore = false;
        }
      }

      const duration = Date.now() - start;
      if (totalDeleted > 0) {
        this.logger.log(`Cleanup finished. Deleted ${totalDeleted} tokens in ${duration}ms.`);
      } else {
        this.logger.debug('No tokens found for cleanup.');
      }
    } catch (error) {
      this.logger.error('Error during token cleanup', error);
    }
  }
}
