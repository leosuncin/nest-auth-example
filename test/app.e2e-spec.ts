import { IntegreSQLClient } from '@devoxa/integresql-client';
import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import dataSourceConfig from '../src/config/data-source.config';
import { setup } from '../src/setup';

const client = new IntegreSQLClient({
  url: process.env['INTEGRESQL_URL'] ?? 'http://localhost:5000',
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let hash: string;

  beforeAll(async () => {
    hash = await client.hashFiles([
      './src/migrations/**/*',
      './src/**/*.factory.ts',
      './src/**/*.seeder.ts',
    ]);

    await client.initializeTemplate(hash, async dbConfig => {
      const { migrations } = await dataSourceConfig();
      const dataSource = new DataSource({
        type: 'postgres',
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        port: dbConfig.port,
        migrations,
      });

      await dataSource.initialize();
      await dataSource.runMigrations();
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
