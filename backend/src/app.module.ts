import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LandingModule } from './landing/landing.module';

import { ScheduleModule } from '@nestjs/schedule';

import { CommonModule } from './common/common.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule,
        CommonModule,
        PrismaModule,
        AuthModule,
        UsersModule,
        LandingModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
