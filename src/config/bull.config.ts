import { registerAs } from '@nestjs/config';
import { BullModuleOptions } from '@nestjs/bull';

import { EMAIL_QUEUE_NAME } from '../mail/mail.constant';

export default registerAs<() => BullModuleOptions>('bull', () => ({
  name: EMAIL_QUEUE_NAME,
  redis: process.env.REDIS_URL,
}));
