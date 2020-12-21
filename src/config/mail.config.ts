import { registerAs } from '@nestjs/config';

import { MailOptions } from '../mail/mail-options.interface';

export default registerAs(
  'mail',
  (): MailOptions => {
    const baseUrl = process.env.CLIENT_BASE_URL ?? 'http://localhost:3001';
    const author = process.env.npm_package_author_name ?? 'Author';
    const from = process.env.npm_package_author_email ?? 'no-reply@example.com';
    const productName = process.env.PRODUCT_NAME ?? 'Nest.js Auth';
    const companyName = process.env.COMPANY_NAME ?? 'ACME Inc.';

    return {
      from,
      productName,
      loginUrl: `${baseUrl}/auth/login`,
      fromName: author,
      companyName,
    };
  },
);
