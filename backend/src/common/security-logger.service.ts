import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger(SecurityLoggerService.name);
  private readonly webhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('ALERT_WEBHOOK_URL') || '';
  }

  logAuthEvent(type: string, detail: Record<string, any>) {
    this.logger.warn(`[SECURITY] ${type}`, detail);
  }

  logRefreshLimitExceeded(ip: string, attempts: number) {
    this.logger.warn(`[SECURITY] AUTH_REFRESH_LIMIT_EXCEEDED - IP: ${ip}, Attempts: ${attempts}`);
    this.notifyAlertWebhook('AUTH_REFRESH_LIMIT_EXCEEDED', { ip, attempts });
  }

  async notifyAlertWebhook(type: string, detail: Record<string, any>) {
    if (!this.webhookUrl) {
      return;
    }

    try {
      const payload = {
        type,
        timestamp: new Date().toISOString(),
        ...detail,
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.warn(
          `Failed to send alert webhook. Status: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      this.logger.warn('Error sending alert webhook', error);
    }
  }
}
