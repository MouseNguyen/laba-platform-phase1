import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      // const duration = Date.now() - start; // Can be used for histogram if needed
      this.metricsService.httpRequestsTotal.inc({
        method: req.method,
        path: req.route?.path || req.path,
        status: res.statusCode,
      });
    });
    next();
  }
}
