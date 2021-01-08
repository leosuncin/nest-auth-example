import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';
import { setup } from '../src/setup';

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = setup(moduleFixture.createNestApplication());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Hello World!');
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
