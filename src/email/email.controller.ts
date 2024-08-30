import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { errorCodes, successCodes } from '../utils/constants';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-otp-email.dto';
import * as Sentry from '@sentry/nestjs';
//It's not activated, but you can activate it for debugging purposes
@Controller('api/v1/emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-otp')
  async sendOtpEmail(@Body() sendOtpEmailDto: SendEmailDto) {
    try {
      await this.emailService.sendOtpEmail(sendOtpEmailDto);
      return {
        statusCode: HttpStatus.OK,
        customCode: 'WGE0071',
        customMessage: successCodes.WGE0071?.description,
        customMessageEs: successCodes.WGE0071?.descriptionEs,
      };
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          customCode: 'WGE0070',
          customMessage: errorCodes.WGE0070?.description,
          customMessageEs: errorCodes.WGE0070?.descriptionEs,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
