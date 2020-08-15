import { Processor, Process } from '@nestjs/bull';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bull';

import { EMAIL_QUEUE_NAME } from '../constants';
import { WELCOME_JOB_NAME } from './mail.constant';
import { SignUp } from '../auth/dto/sign-up.dto';

@Processor(EMAIL_QUEUE_NAME)
export class MailConsumer {
  constructor(private readonly mailerService: MailerService) {}

  @Process(WELCOME_JOB_NAME)
  sendWelcome(job: Job<SignUp>) {
    const productName = 'Nest.js Auth';
    const actionUrl = 'http://localhost:3000/auth/login';
    const fromName = 'Admin';
    const companyName = 'ACME Inc.';
    const { name, email: to } = job.data;

    return this.mailerService.sendMail({
      to,
      from: 'no-reply@example.com',
      subject: `Welcome to ${productName}`,
      template: 'welcome', // The `.ejs` extension is appended automatically.
      context: {
        productName,
        name,
        actionUrl,
        fromName,
        companyName,
      },
    });
  }
}
