import { IntegreSQLClient } from '@devoxa/integresql-client';
import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { dataSourceOptions } from '../src/data-source';
import { setup } from '../src/setup';

const client = new IntegreSQLClient({
  url: process.env['INTEGRESQL_URL'] ?? 'http://localhost:5000',
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let hash: string;

  beforeAll(async () => {
    hash = await client.hashFiles(['./src/migrations/**/*']);

    await client.initializeTemplate(hash, async dbConfig => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideModule(TypeOrmModule)
        .useModule(
          TypeOrmModule.forRoot({
            type: 'postgres',
            url: client.databaseConfigToConnectionUrl(dbConfig),
            migrations: dataSourceOptions.migrations,
            synchronize: false,
          }),
        )
        .compile();
      const dataSource = moduleFixture.get(getDataSourceToken());

      await dataSource.runMigrations();
      await dataSource.destroy();
      await moduleFixture.close();
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
          url: client.databaseConfigToConnectionUrl(dbConfig),
          migrations: dataSourceOptions.migrations,
          synchronize: false,
        }),
      )
      .compile();

    app = setup(moduleFixture.createNestApplication());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(HttpStatus.OK)
      .expect(response =>
        expect(response.body).toMatchObject(
          expect.objectContaining({
            details: {
              db: {
                status: expect.stringMatching(/up/i),
              },
              mem_rss: {
                status: expect.stringMatching(/up/i),
              },
            },
            error: {},
            info: {
              db: {
                status: expect.stringMatching(/up/i),
              },
              mem_rss: {
                status: expect.stringMatching(/up/i),
              },
            },
            status: 'ok',
          }),
        ),
      );
  });
});
