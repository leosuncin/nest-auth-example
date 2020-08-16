import { registerAs } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

export default registerAs<() => MailerOptions>('mailer', () => {
  const host = process.env.SMTP_HOST ?? 'localhost';
  const port = parseInt(process.env.SMTP_PORT, 10) || 1025;
  const secure = ['true', '1', 1].includes(process.env.SMTP_SECURE);
  const user = process.env.SMTP_AUTH_USER || 'username';
  const pass = process.env.SMTP_AUTH_PASS || 'password';

  return {
    transport: {
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
