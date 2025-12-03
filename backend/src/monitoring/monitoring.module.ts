import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';
import { ConfigModule } from '@nestjs/config';
import { MetricsService } from './metrics.service';
import { MonitoringController } from './monitoring.controller';
import { MetricsMiddleware } from './metrics.middleware';
import { BasicAuthGuard } from './basic-auth.guard';

@Module({
    imports: [
        ConfigModule,
        PrometheusModule.register({
            controller: MonitoringController,
            path: '/metrics',
            defaultMetrics: {
                enabled: true,
            },
        }),
    ],
    controllers: [MonitoringController],
    providers: [
        MetricsService,
        BasicAuthGuard,
        makeCounterProvider({
            name: 'http_requests_total',
            help: 'Total HTTP requests',
            labelNames: ['method', 'path', 'status'],
        }),
        makeCounterProvider({
            name: 'laba_auth_events_total',
            help: 'Auth events count',
            labelNames: ['event_type'],
        }),
        makeGaugeProvider({
            name: 'auth_active_sessions',
            help: 'Number of active sessions',
        }),
    ],
    exports: [MetricsService],
})
export class MonitoringModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(MetricsMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
