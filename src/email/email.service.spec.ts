import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as SQS from '@aws-sdk/client-sqs';

import { SendOtpEmailDto } from './dto/send-otp-email.dto';
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

  const sendOtpEmailDto: SendOtpEmailDto = {
    username: 'testuser',
    email: 'test@example.com',
    otp: '123456',
  };

  const expectedEmailDetails = {
    to: 'test@example.com',
    subject: 'Action required: Activate Your Account',
    template: './login',
    context: {
      username: 'testuser',
      email: 'test@example.com',
      otp: '123456',
      portalUrl: 'https://www.mywalletguru.com/',
    },
    attachments: [
      {
        filename: 'logo.png',
        path: '/home/claudioloz7/wallet-guru/wg-backend-notification/src/email/assets/images/logo.png',
        cid: 'logo',
      },
    ],
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

  it('should handle the message and send an email successfully', async () => {
    const sendMailSpy = jest
      .spyOn(mailerService, 'sendMail')
      .mockResolvedValueOnce(null);

    const message: SQS.Message = {
      Body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        otp: '123456',
      }),
    };

    await service.handleMessage(message);

    expect(sendMailSpy).toHaveBeenCalledWith(expectedEmailDetails);
  });

  it('should send a welcome email manually successfully', async () => {
    const sendMailSpy = jest
      .spyOn(mailerService, 'sendMail')
      .mockResolvedValueOnce(null);

    await service.sendOtpEmail(sendOtpEmailDto);

    expect(sendMailSpy).toHaveBeenCalledWith(expectedEmailDetails);
  });

  it('should throw an InternalServerErrorException if manual email sending fails', async () => {
    jest
      .spyOn(mailerService, 'sendMail')
      .mockRejectedValueOnce(new Error('Failed to send email'));

    await expect(service.sendOtpEmail(sendOtpEmailDto)).rejects.toThrow(
      InternalServerErrorException
    );
  });

  it('should prepare email details correctly', () => {
    const emailDetails = service['prepareEmailDetails'](sendOtpEmailDto);

    expect(emailDetails).toEqual({
      email: expectedEmailDetails.to,
      subject: expectedEmailDetails.subject,
      templatePath: expectedEmailDetails.template,
      context: expectedEmailDetails.context,
    });
  });
});
