import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailModule } from './email/email.module';

@Module({
  imports: [ConfigModule.forRoot(), EmailModule],
})
export class AppModule {}
