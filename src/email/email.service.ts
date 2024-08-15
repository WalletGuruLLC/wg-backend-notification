import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as SQS from '@aws-sdk/client-sqs';
import { resolve } from 'path';

import { SendOtpEmailDto } from './dto/send-otp-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {}

  @SqsMessageHandler('paystreme-notifications', false)
  async handleMessage(message: SQS.Message) {
    try {
      this.logger.log(`Message received ${message.Body}`);
      const body = JSON.parse(message.Body);
      const { email, subject, templatePath, context } =
        this.prepareEmailDetails(body);
      await this.processSendEmail(email, subject, templatePath, context);
    } catch (error) {
      this.logger.error(`Error handling message`, error);
    }
  }

  async sendOtpEmail(sendOtpEmailDto: SendOtpEmailDto): Promise<void> {
    const { email, subject, templatePath, context } =
      this.prepareEmailDetails(sendOtpEmailDto);
    await this.processSendEmail(email, subject, templatePath, context);
  }

  private prepareEmailDetails(sendOtpEmailDto: SendOtpEmailDto) {
    const { username, email, otp } = sendOtpEmailDto;
    const subject = `Action required: Activate Your Account`;
    const templatePath = './login';
    const context = { username, email, otp };

    return { email, subject, templatePath, context };
  }

  private async processSendEmail(
    to: string,
    subject: string,
    templatePath: string,
    context: any
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: templatePath,
        context,
        attachments: [
          {
            filename: 'logo.png',
            path: resolve(__dirname, 'assets', 'images', 'logo.png'),
            cid: 'logo',
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error.stack);
      throw error;
    }
  }
}
