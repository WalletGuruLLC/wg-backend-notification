import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendOtpEmailDto } from './dto/send-otp-email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('otp')
  async sendOtpEmail(@Body() sendOtpEmailDto: SendOtpEmailDto): Promise<void> {
    return this.emailService.sendOtpEmail(sendOtpEmailDto);
  }
}
