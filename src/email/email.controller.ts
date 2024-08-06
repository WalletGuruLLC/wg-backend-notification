import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendWelcomeEmailDto } from './dto/send-welcome-email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('welcome-manually')
  async sendWelcomeEmailManually(
    @Body() sendWelcomeEmailDto: SendWelcomeEmailDto
  ): Promise<void> {
    return this.emailService.sendWelcomeEmailManually(sendWelcomeEmailDto);
  }
}
