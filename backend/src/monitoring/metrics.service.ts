import { Injectable } from '@nestjs/common';
import { Counter, Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
    constructor(
        @InjectMetric('http_requests_total') public readonly httpRequestsTotal: Counter<string>,
        @InjectMetric('laba_auth_events_total') public readonly authEvents: Counter<string>,
        @InjectMetric('auth_active_sessions') public readonly activeSessions: Gauge<string>,
    ) { }

    recordAuthEvent(eventType: 'LOGIN_FAIL' | 'TOKEN_REUSE' | 'ACCOUNT_LOCKED') {
        this.authEvents.inc({ event_type: eventType });
    }
}
