import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

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

  async sendWelcomeEmail(
    sendWelcomeEmailDto: SendWelcomeEmailDto
  ): Promise<void> {
    //TODO: integrate with SQS for the different use cases
    const { email, subject, templatePath, context } =
      this.prepareEmailDetails(sendWelcomeEmailDto);
    await this.processSendEmail(email, subject, templatePath, context);
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
    const subject = `Welcome to Company: ${username}`;
    const templatePath = './welcome';
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
      });
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error.stack);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
