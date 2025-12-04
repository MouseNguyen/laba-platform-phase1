import { Module } from '@nestjs/common';
import { UsersAdminController } from './users-admin.controller';
import { UsersAdminService } from './users-admin.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [UsersAdminController],
    providers: [
        UsersAdminService,
        PrismaService,
        // TODO: Add lock/unlock, assign roles, assign to branch logic
    ],
    exports: [UsersAdminService],
})
export class UsersAdminModule { }
