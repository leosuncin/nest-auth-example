import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import * as faker from 'faker';
import * as supertest from 'supertest';

import { AppModule } from '../src/app.module';

function generateUser() {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet.exampleEmail(firstName, lastName),
    password: 'Pa$$w0rd',
  };
}

function getAuthResponseCallback(done: jest.DoneCallback) {
  return (err, resp: supertest.Response) => {
    if (err) {
      return done(err);
    }

    expect(resp.body).toBeDefined();
    expect(resp.body.password).toBeUndefined();
    expect(resp.header.authorization).toMatch(/Bearer\s+.*/);

    return done();
  };
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    request = supertest(app.getHttpServer());
  });

  afterEach(async () => {
    await app.close();
  });

  it('should allow to sign up a new user', done => {
    request
      .post('/auth/register')
      .send(generateUser())
      .expect(HttpStatus.OK)
      .end(getAuthResponseCallback(done));
  });

  it('should allow to sign in an user', done => {
    request
      .post('/auth/login')
      .send({
        email: 'john@doe.me',
        password: 'Pa$$w0rd',
      })
      .expect(HttpStatus.OK)
      .end(getAuthResponseCallback(done));
  });
});
