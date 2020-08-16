import { Processor, Process } from '@nestjs/bull';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';

import { EMAIL_QUEUE_NAME, WELCOME_JOB_NAME } from './mail.constant';
import { SignUp } from '../auth/dto/sign-up.dto';
import { MailOptions } from './mail-options.interface';

@Processor(EMAIL_QUEUE_NAME)
export class MailConsumer {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  @Process(WELCOME_JOB_NAME)
  sendWelcome(job: Job<SignUp>) {
    const {
      productName,
      loginUrl: actionUrl,
      fromName,
      companyName,
      from,
    } = this.config.get<MailOptions>('mail');
    const { name, email: to } = job.data;

    return this.mailerService.sendMail({
      to,
      from,
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
