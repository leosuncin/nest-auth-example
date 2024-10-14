import { IntegreSQLClient } from '@devoxa/integresql-client';
import { faker } from '@faker-js/faker';
import { build, perBuild } from '@jackfranklin/test-data-bot';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import dataSourceConfig from '../src/config/data-source.config';
import { setup } from '../src/setup';

const updateBuilder = build({
  fields: {
    name: perBuild(() => faker.person.fullName()),
  },
});
const client = new IntegreSQLClient({
  url: process.env['INTEGRESQL_URL'] ?? 'http://localhost:5000',
});

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let token: string;
  let userId;
  let hash: string;

  beforeAll(async () => {
    hash = await client.hashFiles([
      './src/migrations/**/*',
      './src/**/*.factory.ts',
      './src/**/*.seeder.ts',
    ]);

    await client.initializeTemplate(hash, async dbConfig => {
      const options = (await dataSourceConfig()) as PostgresConnectionOptions;
      const dataSource = new DataSource({
        ...options,
        url: client.databaseConfigToConnectionUrl({
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          port: dbConfig.port,
          host: 'localhost',
        }),
      });

      await dataSource.initialize();
      await dataSource.runMigrations();
      await runSeeders(dataSource);
      await dataSource.destroy();
    });
  });

  beforeEach(async () => {
    const dbConfig = await client.getTestDatabase(hash);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(dataSourceConfig.KEY)
      .useValue({
        type: 'postgres',
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        port: dbConfig.port,
        synchronize: false,
        autoLoadEntities: true,
      })
      .compile();

    app = setup(moduleFixture.createNestApplication());
    const authService = app.get(AuthService);
    await app.init();

    request = supertest(app.getHttpServer());

    // @ts-expect-error Fixture
    token = authService.signToken({ email: 'john@doe.me' });
    userId = 1;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should show the user profile', async () => {
    const { body } = await request
      .get(`/profile/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(body).not.toHaveProperty('password');
  });

  it('should fail to show user profile without authorization', async () => {
    const resp = await request
      .get(`/profile/${userId}`)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(resp.body).toBeDefined();
  });

  it('should update the user profile', async () => {
    const { body } = await request
      .put(`/profile/${userId}`)
      .send(updateBuilder())
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(body).not.toHaveProperty('password');
  });

  it('should require the name when update profile', async () => {
    const resp = await request
      .put(`/profile/${userId}`)
      .send({ name: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    expect(resp.body).toBeDefined();
  });

  it('should fail to update the profile without authorization', async () => {
    const resp = await request
      .put(`/profile/${userId}`)
      .send(updateBuilder())
      .expect(HttpStatus.UNAUTHORIZED);

    expect(resp.body).toBeDefined();
  });
});
