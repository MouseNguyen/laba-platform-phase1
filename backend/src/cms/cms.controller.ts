import { Controller } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms') // Base route: /api/v1/cms
export class CmsController {
    constructor(private readonly cmsService: CmsService) { }
    // TODO: Add @Get, @Post, @Put, @Delete routes for posts/pages
}
