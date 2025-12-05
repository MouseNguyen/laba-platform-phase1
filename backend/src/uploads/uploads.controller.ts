import { existsSync } from 'fs';
import { join } from 'path';

import { Controller, Get, Param, Res, NotFoundException, VERSION_NEUTRAL } from '@nestjs/common';
import { Response } from 'express';

// This controller is excluded from global prefix via main.ts exclude option
@Controller({ path: 'uploads', version: VERSION_NEUTRAL })
export class UploadsController {
  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    // __dirname is dist/src/uploads, so we need to go up 3 levels then into uploads
    // dist/src/uploads -> dist/src -> dist -> backend -> backend/uploads
    const filePath = join(__dirname, '..', '..', '..', 'uploads', filename);
    console.log('[UploadsController] Serving file:', filePath);

    if (!existsSync(filePath)) {
      console.log('[UploadsController] File not found:', filePath);
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }
}
