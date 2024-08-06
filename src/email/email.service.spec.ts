import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SendWelcomeEmailDto } from './dto/send-welcome-email.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('https://www.mywalletguru.com/'),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const sendWelcomeEmailDto: SendWelcomeEmailDto = {
    username: 'testuser',
    email: 'test@example.com',
    otp: '123456',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a welcome email successfully', async () => {
    const sendMailSpy = jest
      .spyOn(mailerService, 'sendMail')
      .mockResolvedValueOnce(null);

    await service.sendWelcomeEmail(sendWelcomeEmailDto);

    expect(sendMailSpy).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Welcome to Company: testuser',
      template: './welcome',
      context: {
        username: 'testuser',
        email: 'test@example.com',
        otp: '123456',
        portalUrl: 'https://www.mywalletguru.com/',
      },
    });
  });

  it('should send a welcome email manually successfully', async () => {
    const sendMailSpy = jest
      .spyOn(mailerService, 'sendMail')
      .mockResolvedValueOnce(null);

    await service.sendWelcomeEmailManually(sendWelcomeEmailDto);

    expect(sendMailSpy).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Welcome to Company: testuser',
      template: './welcome',
      context: {
        username: 'testuser',
        email: 'test@example.com',
        otp: '123456',
        portalUrl: 'https://www.mywalletguru.com/',
      },
    });
  });

  it('should throw an InternalServerErrorException if email sending fails', async () => {
    jest
      .spyOn(mailerService, 'sendMail')
      .mockRejectedValueOnce(new Error('Failed to send email'));

    await expect(service.sendWelcomeEmail(sendWelcomeEmailDto)).rejects.toThrow(
      InternalServerErrorException
    );
  });

  it('should throw an InternalServerErrorException if manual email sending fails', async () => {
    jest
      .spyOn(mailerService, 'sendMail')
      .mockRejectedValueOnce(new Error('Failed to send email'));

    await expect(
      service.sendWelcomeEmailManually(sendWelcomeEmailDto)
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should prepare email details correctly', () => {
    const emailDetails = service['prepareEmailDetails'](sendWelcomeEmailDto);

    expect(emailDetails).toEqual({
      email: 'test@example.com',
      subject: 'Welcome to Company: testuser',
      templatePath: './welcome',
      context: {
        username: 'testuser',
        email: 'test@example.com',
        otp: '123456',
        portalUrl: 'https://www.mywalletguru.com/',
      },
    });
  });
});
