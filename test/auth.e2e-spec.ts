import { build, fake } from '@jackfranklin/test-data-bot';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as supertest from 'supertest';

import { AppModule } from '../src/app.module';

const userBuilder = build('User', {
  fields: {
    name: fake((f) => f.name.findName()),
    email: fake((f) => f.internet.exampleEmail()),
    password: 'Pa$$w0rd',
  },
});


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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        validationError: { target: false },
      }),
    );
    app.use(cookieParser(process.env.APP_SECRET));
    app.use(
      session({
        secret: process.env.APP_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          sameSite: 'strict',
        }
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    request = supertest(app.getHttpServer());
  });

  afterEach(async () => {
    await app.close();
  });

  it('should allow to sign up a new user', done => {
    request
      .post('/auth/register')
      .send(userBuilder())
      .expect(HttpStatus.CREATED)
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
