import { ok } from 'node:assert/strict';

import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserSubscriber } from '../auth/subscribers/user.subscriber';

export default registerAs<TypeOrmModuleOptions>('data-source', () => {
  ok(process.env.DATABASE_URL, 'DATABASE_URL environment variable is required');

  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    subscribers: [UserSubscriber],
    autoLoadEntities: true,
    synchronize: false,
  };
});
