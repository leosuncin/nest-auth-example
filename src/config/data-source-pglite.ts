import { citext } from '@electric-sql/pglite/contrib/citext';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { SeederOptions } from 'typeorm-extension';
import { PGliteDriver } from 'typeorm-pglite';

import { User } from '../auth/entities/user.entity';
import { userFactory } from '../auth/factories/user.factory';
import { UserSeeder } from '../auth/seeders/user.seeder';
import { UserSubscriber } from '../auth/subscribers/user.subscriber';
import { CreateUser1557166726050 as CreateUser } from '../migrations/1557166726050-create-user';
import { CreateSessionStorage1584985637890 as CreateSessionStorage } from '../migrations/1584985637890-create-session-storage';
import { CreateTodo1597106889894 as CreateTodo } from '../migrations/1597106889894-create-todo';
import { Todo } from '../todo/entities/todo.entity';
import { todoFactory } from '../todo/factories/todo.factory';
import { TodoSeeder } from '../todo/seeders/todo.seeder';

export default registerAs<TypeOrmModuleOptions & SeederOptions>(
  'data-source',
  () => ({
    type: 'postgres',
    driver: new PGliteDriver({
      extensions: { citext, pgcrypto },
    }).driver,
    entities: [User, Todo],
    migrations: [CreateUser, CreateSessionStorage, CreateTodo],
    subscribers: [UserSubscriber],
    factories: [userFactory, todoFactory],
    seeds: [UserSeeder, TodoSeeder],
    extensions: ['citext'],
    uuidExtension: 'pgcrypto',
    installExtensions: true,
    autoLoadEntities: true,
    migrationsRun: true,
  })
);
