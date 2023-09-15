import { IntegreSQLClient } from '@devoxa/integresql-client';
import { faker } from '@faker-js/faker';
import { build, perBuild } from '@jackfranklin/test-data-bot';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { runSeeders } from 'typeorm-extension';

import { AppModule } from '../src/app.module';
import { appDataSource as dataSource } from '../src/data-source';
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
      dataSource.setOptions({
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        port: dbConfig.port,
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
      .overrideModule(TypeOrmModule)
      .useModule(
        TypeOrmModule.forRoot({
          type: 'postgres',
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          port: dbConfig.port,
          synchronize: false,
          autoLoadEntities: true,
        }),
      )
      .compile();

    app = setup(moduleFixture.createNestApplication());
    await app.init();

    request = supertest(app.getHttpServer());

    const {
      header: { authorization },
      body: { id },
    } = await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@doe.me', password: 'Pa$$w0rd' });
    [, token] = authorization.split(/\s+/);
    userId = id;
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
