import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { SecretsModule } from './secrets.module';

@Module({
  imports: [
    SecretsModule,
    ConfigModule.forRoot(), // Load environment variables first
    EmailModule,
  ],
})
export class AppModule {}
