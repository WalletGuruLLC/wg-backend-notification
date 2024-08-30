import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as SQS from '@aws-sdk/client-sqs';

import { SendEmailDto } from './dto/send-otp-email.dto';
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

  const sendOtpEmailDto: SendEmailDto = {
    event: 'LOGGED_IN',
    username: 'testuser',
    email: 'test@example.com',
    value: '123456',
  };

  const expectedEmailDetails = {
    to: 'test@example.com',
    subject: 'Your One-Time Password (OTP) for Secure Access',
    template: './logged-in',
    context: {
      username: 'testuser',
      email: 'test@example.com',
      value: '123456',
      url: undefined,
    },
    attachments: [
      {
        filename: 'logo.png',
        // path: '/Users/cristiandulcey/Work/scrummers/wallet_guru/wg_backend_notification/src/email/assets/images/logo.png',
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

  it('should handle the message from SQS and send an otp email successfully', async () => {
    // const sendMailSpy = jest
    //   .spyOn(mailerService, 'sendMail')
    //   .mockResolvedValueOnce(null);

    const message: SQS.Message = {
      Body: JSON.stringify({
        event: 'LOGGED_IN',
        username: 'testuser',
        email: 'test@example.com',
        value: '123456',
      }),
    };

    await service.handleMessage(message);
    //TODO: Fix this tests after

    // expect(sendMailSpy).toHaveBeenCalledWith(expectedEmailDetails);
  });

  it('should send a otp email successfully', async () => {
    // const sendMailSpy = jest
    //   .spyOn(mailerService, 'sendMail')
    //   .mockResolvedValueOnce(null);

    await service.sendOtpEmail(sendOtpEmailDto);
    //TODO: Fix this tests after
    // expect(sendMailSpy).toHaveBeenCalledWith(expectedEmailDetails);
  });

  it('should throw an InternalServerErrorException if otp email sending fails', async () => {
    jest
      .spyOn(mailerService, 'sendMail')
      .mockRejectedValueOnce(new InternalServerErrorException());

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
