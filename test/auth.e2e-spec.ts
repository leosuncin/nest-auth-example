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

const userBuilder = build({
  fields: {
    name: perBuild(() => faker.person.fullName()),
    email: perBuild(() => faker.internet.exampleEmail()),
    password: 'Pa$$w0rd',
  },
});
const client = new IntegreSQLClient({
  url: process.env['INTEGRESQL_URL'] ?? 'http://localhost:5000',
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let hash: string;

  beforeAll(async () => {
    hash = await client.hashFiles([
      './src/migrations/**/*',
      './src/**/*.factory.ts',
      './src/**/*.seeder.ts',
    ]);

    await client.initializeTemplate(hash, async dbConfig => {
      dataSource.setOptions({
        url: undefined,
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
  });

  afterEach(async () => {
    await app.close();
  });

  it.each([
    ['/auth/register', userBuilder(), HttpStatus.CREATED],
    [
      '/auth/login',
      {
        email: 'john@doe.me',
        password: 'Pa$$w0rd',
      },
      HttpStatus.OK,
    ],
    [
      '/auth/register',
      { name: null, email: null, password: null },
      HttpStatus.UNPROCESSABLE_ENTITY,
    ],
    ['/auth/login', { email: '', password: '' }, HttpStatus.UNAUTHORIZED],
    [
      '/auth/login',
      { email: 'john@doe.me', password: '' },
      HttpStatus.UNAUTHORIZED,
    ],
  ])(
    'should make a POST request to %s with %p and expect %d status',
    async (url, body, statusCode) => {
      const resp = await request.post(url).send(body).expect(statusCode);

      expect(resp.body).toBeDefined();
      expect(resp.body.password).toBeUndefined();
      if (resp.ok) expect(resp.header.authorization).toMatch(/Bearer\s+.*/);
    },
  );

  it('should get session user', async () => {
    const {
      header: { authorization },
    } = await request
      .post('/auth/login')
      .send({
        email: 'john@doe.me',
        password: 'Pa$$w0rd',
      })
      .expect(HttpStatus.OK);
    const resp = await request
      .get('/auth/me')
      .set('Authorization', authorization);

    expect(resp.body).toBeDefined();
    expect(resp.body.password).toBeUndefined();
  });
});
