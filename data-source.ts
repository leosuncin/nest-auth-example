import { ok } from 'node:assert/strict';

import { DataSource, type DataSourceOptions } from 'typeorm';
import type { SeederOptions } from 'typeorm-extension';
import { User } from './src/auth/entities/user.entity';
import { userFactory } from './src/auth/factories/user.factory';
import { UserSeeder } from './src/auth/seeders/user.seeder';
import { UserSubscriber } from './src/auth/subscribers/user.subscriber';
import { CreateUser1557166726050 } from './src/migrations/1557166726050-create-user';
import { CreateSessionStorage1584985637890 } from './src/migrations/1584985637890-create-session-storage';
import { CreateTodo1597106889894 } from './src/migrations/1597106889894-create-todo';
import { Todo } from './src/todo/entities/todo.entity';
import { todoFactory } from './src/todo/factories/todo.factory';
import { TodoSeeder } from './src/todo/seeders/todo.seeder';

ok(process.env.DATABASE_URL, 'DATABASE_URL environment variable is required');

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  entities: [User, Todo],
  migrations: [
    CreateUser1557166726050,
    CreateSessionStorage1584985637890,
    CreateTodo1597106889894,
  ],
  subscribers: [UserSubscriber],
  factories: [userFactory, todoFactory],
  seeds: [UserSeeder, TodoSeeder],
  extensions: ['citext'],
  uuidExtension: 'pgcrypto',
  installExtensions: true,
};

export const app = new DataSource(options);
