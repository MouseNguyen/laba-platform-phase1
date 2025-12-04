/**
 * CMS MODULE
 * Module: CMS (Content Management)
 * Phase: 1
 *
 * @author Laba Platform Team
 * @since 2024-01-15
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { UploadController } from './upload.controller';

/**
 * CMS Module - Content Management System
 * Provides endpoints for managing posts, pages, and other content
 */
@Module({
    imports: [
        PrismaModule,
    ],
    providers: [PostsService],
    controllers: [PostsController, UploadController],
    exports: [PostsService],
})
export class CmsModule { }
