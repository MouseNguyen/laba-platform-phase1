import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [BranchesController],
    providers: [
        BranchesService,
        PrismaService,
        // TODO: Add BranchStaffService, BranchSettingsService in Phase 1.3
    ],
    exports: [BranchesService],
})
export class BranchesModule { }
