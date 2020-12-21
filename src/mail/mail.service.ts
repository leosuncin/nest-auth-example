import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SignUp } from '../auth/dto/sign-up.dto';
import { MailOptions } from './mail-options.interface';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  sendWelcomeEmail(signUp: SignUp): Promise<any> {
    const {
      fromName,
      from,
      productName,
      companyName,
      loginUrl: actionUrl,
    } = this.config.get<MailOptions>('mail');
    const { name, email: to } = signUp;

    return this.mailer.sendMail({
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
