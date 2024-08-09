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

import { SendWelcomeEmailDto } from './dto/send-welcome-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly PORTAL_URL: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {
    this.PORTAL_URL = this.configService.get<string>(
      'PORTAL_URL',
      'https://www.mywalletguru.com/'
    );
  }

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

  async sendWelcomeEmailManually(
    sendWelcomeEmailDto: SendWelcomeEmailDto
  ): Promise<void> {
    const { email, subject, templatePath, context } =
      this.prepareEmailDetails(sendWelcomeEmailDto);
    await this.processSendEmail(email, subject, templatePath, context);
  }

  private prepareEmailDetails(sendWelcomeEmailDto: SendWelcomeEmailDto) {
    const { username, email, otp } = sendWelcomeEmailDto;
    const subject = `Action required: Activate Your Account`;
    const templatePath = './login';
    const context = { username, email, otp, portalUrl: this.PORTAL_URL };

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
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error.stack);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
