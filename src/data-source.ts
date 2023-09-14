import { DataSource, type DataSourceOptions } from 'typeorm';
import { type SeederOptions } from 'typeorm-extension';

import { CreateUser1557166726050 } from './migrations/1557166726050-CreateUser';
import { CreateProfile1570141220019 } from './migrations/1570141220019-CreateProfile';
import { CreateSessionStorage1584985637890 } from './migrations/1584985637890-CreateSessionStorage';
import { CreateTodo1597106889894 } from './migrations/1597106889894-CreateTodo';
import { Todo } from './todo/entities/todo.entity';
import { todoFactory } from './todo/factories/todo.factory';
import { TodoSeeder } from './todo/seeders/todo.seeder';
import { Profile } from './user/entities/profile.entity';
import { User } from './user/entities/user.entity';
import { profileFactory } from './user/factories/profile.factory';
import { userFactory } from './user/factories/user.factory';
import { ProfileSeeder } from './user/seeders/profile.seeder';
import { UserSeeder } from './user/seeders/user.seeder';

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Profile, Todo],
  migrations: [
    CreateUser1557166726050,
    CreateProfile1570141220019,
    CreateSessionStorage1584985637890,
    CreateTodo1597106889894,
  ],
  synchronize: false,
  extra: {
    ssl:
      process.env.SSL_MODE === 'require'
        ? {
            rejectUnauthorized: false,
          }
        : false,
  },
  factories: [userFactory, profileFactory, todoFactory],
  seeds: [UserSeeder, ProfileSeeder, TodoSeeder],
};

export const appDataSource = new DataSource(dataSourceOptions);
