import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as SQS from '@aws-sdk/client-sqs';
import { resolve } from 'path';

import { SendEmailDto } from './dto/send-otp-email.dto';
import * as Sentry from '@sentry/nestjs';

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
      Sentry.captureException(error);
      this.logger.error(`Error handling message`, error);
    }
  }

  async sendOtpEmail(sendEmailDto: SendEmailDto): Promise<void> {
    const { email, subject, templatePath, context } =
      this.prepareEmailDetails(sendEmailDto);
    await this.processSendEmail(email, subject, templatePath, context);
  }

  private prepareEmailDetails(sendEmailDto: SendEmailDto) {
    const { event, username, email, value } = sendEmailDto;
    console.log('sendEmailDto', sendEmailDto);

    let subject;
    let templatePath;
    let url;
    switch (event) {
      case 'WALLET_USER_CREATED':
        subject = `Please Verify Your Email Address`;
        templatePath = './wallet-user-created';
        break;
      case 'FIRST_PASSWORD_GENERATED':
        subject = `Welcome to Wallet Guru, ${username}`;
        templatePath = './first-password-generated';
        url = `${this.configService.get('FRONTEND_ACTIVE_ACCOUNT_URL', 'https://dev.admin.walletguru.co/')}`;
        break;
      case 'LOGGED_IN':
        subject = `Your One-Time Password (OTP) for Secure Access`;
        templatePath = './logged-in';
        break;
      case 'SEND_MONEY_CONFIRMATION':
        subject = `Confirmation of Your Transfer from Wallet Guru`;
        templatePath = './send-money-confirmation';
        break;
      default:
        break;
    }

    const context = { username, email, value, url };

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
      Sentry.captureException(error);
      this.logger.error(`Error sending email to ${to}`, error.stack);
      throw error;
    }
  }
}
