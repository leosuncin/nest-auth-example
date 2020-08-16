import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import { SignUp } from '../auth/dto/sign-up.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  sendWelcomeEmail(signUp: SignUp): Promise<any> {
    const baseUrl = process.env.CLIENT_BASE_URL ?? 'http://localhost:3001';
    const fromName = process.env.npm_package_author_name ?? 'Author';
    const from = process.env.npm_package_author_email ?? 'no-reply@example.com';
    const productName = process.env.PRODUCT_NAME ?? 'Nest.js Auth';
    const companyName = process.env.COMPANY_NAME ?? 'ACME Inc.';
    const actionUrl = `${baseUrl}/auth/login`;
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
