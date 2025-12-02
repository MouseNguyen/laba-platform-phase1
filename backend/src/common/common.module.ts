import { Module, Global } from '@nestjs/common';
import { SecurityLoggerService } from './security-logger.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [SecurityLoggerService],
    exports: [SecurityLoggerService],
})
export class CommonModule { }
