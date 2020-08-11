import { build, fake } from '@jackfranklin/test-data-bot';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';

import { AppModule } from '../src/app.module';
import { setup } from '../src/setup';

const userBuilder = build({
  fields: {
    name: fake(f => f.name.findName()),
    email: fake(f => f.internet.exampleEmail()),
    password: 'Pa$$w0rd',
  },
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
