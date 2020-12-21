import { registerAs } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as mailgunTransport from 'nodemailer-mailgun-transport';

export default registerAs<() => MailerOptions>('mailer', () => {
  const prod = process.env.NODE_ENV === 'production';
  const host = process.env.MAILGUN_SMTP_SERVER;
  const port = parseInt(process.env.MAILGUN_SMTP_PORT, 10);
  const secure = ['true', '1', 1].includes(process.env.SMTP_SECURE);
  const user = process.env.MAILGUN_SMTP_LOGIN;
  const pass = process.env.MAILGUN_SMTP_PASSWORD;

  return {
    transport: prod ? mailgunTransport({
      auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      }
    }) : {
      host,
      port,
      secure,
      ignoreTLS: !secure,
      auth: {
        user,
        pass,
      },
    },
    template: {
      dir: process.cwd() + '/templates/',
      adapter: new EjsAdapter(),
    },
  };
});
