import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DataSourceOptions } from 'typeorm';
import type { SeederOptions } from 'typeorm-extension';

export default registerAs(
  'data-source',
  async (): Promise<TypeOrmModuleOptions & SeederOptions> => {
    const type: DataSourceOptions['type'] = 'postgres';
    const url = process.env.DATABASE_URL;
    const synchronize = false;
    const extra: DataSourceOptions['extra'] = {
      ssl:
        process.env.SSL_MODE === 'require'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    };
    const autoLoadEntities = true;

    if (process.env.NODE_ENV === 'test') {
      return {
        type,
        url,
        synchronize,
        entities: await Promise.all([
          import('../user/entities/user.entity').then(({ User }) => User),
          import('../user/entities/profile.entity').then(
            ({ Profile }) => Profile,
          ),
          import('../todo/entities/todo.entity').then(({ Todo }) => Todo),
        ]),
        migrations: await Promise.all([
          import('../migrations/1557166726050-CreateUser').then(
            ({ CreateUser1557166726050 }) => CreateUser1557166726050,
          ),
          import('../migrations/1570141220019-CreateProfile').then(
            ({ CreateProfile1570141220019 }) => CreateProfile1570141220019,
          ),
          import('../migrations/1584985637890-CreateSessionStorage').then(
            ({ CreateSessionStorage1584985637890 }) =>
              CreateSessionStorage1584985637890,
          ),
          import('../migrations/1597106889894-CreateTodo').then(
            ({ CreateTodo1597106889894 }) => CreateTodo1597106889894,
          ),
        ]),
        factories: await Promise.all([
          import('../user/factories/user.factory').then(
            ({ userFactory }) => userFactory,
          ),
          import('../user/factories/profile.factory').then(
            ({ profileFactory }) => profileFactory,
          ),
          import('../todo/factories/todo.factory').then(
            ({ todoFactory }) => todoFactory,
          ),
        ]),
        seeds: await Promise.all([
          import('../user/seeders/user.seeder').then(
            ({ UserSeeder }) => UserSeeder,
          ),
          import('../user/seeders/profile.seeder').then(
            ({ ProfileSeeder }) => ProfileSeeder,
          ),
          import('../todo/seeders/todo.seeder').then(
            ({ TodoSeeder }) => TodoSeeder,
          ),
        ]),
      };
    }

    return {
      type,
      url,
      autoLoadEntities,
      synchronize,
      extra,
    };
  },
);
