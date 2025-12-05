import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SecurityLoggerService } from './security-logger.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SecurityLoggerService],
  exports: [SecurityLoggerService],
})
export class CommonModule {}
