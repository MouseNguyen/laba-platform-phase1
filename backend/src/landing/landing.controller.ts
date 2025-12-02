import { Controller, Get, Query } from '@nestjs/common';
import { LandingService } from './landing.service';

@Controller('landing')
export class LandingController {
    constructor(private landingService: LandingService) { }

    @Get()
    async getLanding(@Query('locale') locale?: string) {
        const blocks = await this.landingService.getLandingBlocks(locale || 'vi');
        return {
            locale: locale || 'vi',
            blocks: blocks,
        };
    }
}
