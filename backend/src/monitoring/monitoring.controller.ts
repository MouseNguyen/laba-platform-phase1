import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';

import { BasicAuthGuard } from './basic-auth.guard';

@Controller('metrics')
@UseGuards(BasicAuthGuard)
export class MonitoringController extends PrometheusController {
  // Inherits index() from PrometheusController but we override to apply guard
  @Get()
  async index(@Res({ passthrough: true }) response: Response) {
    return super.index(response);
  }
}
