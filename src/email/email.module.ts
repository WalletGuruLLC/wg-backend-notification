import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SQSClient } from '@aws-sdk/client-sqs';

import { EmailService } from './email.service';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [],
      useFactory: async () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        },
        defaults: {
          from: process.env.MAIL_FROM,
        },
        template: {
          dir: join(__dirname, './assets/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [],
    }),
    SqsModule.registerAsync({
      imports: [],
      useFactory: async () => ({
        consumers: [
          {
            name: 'paystreme-notifications',
            queueUrl: process.env.SQS_QUEUE_URL,
            region: process.env.AWS_REGION,
          },
        ],
      }),
      inject: [],
    }),
  ],
  controllers: [],
  providers: [
    EmailService,
    {
      provide: 'SQS_CLIENT',
      useValue: sqsClient,
    },
  ],
})
export class EmailModule {}
