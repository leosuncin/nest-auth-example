import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as faker from 'faker';
import * as passport from 'passport';
import * as supertest from 'supertest';

import { AppModule } from '../src/app.module';

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let token;
  let userId;

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

  it('should show the user profile', done => {
    request
      .get(`/profile/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        expect(resp.body).not.toHaveProperty('password');
        return done();
      });
  });

  it('should fail to show user profile without authorization', done => {
    request
      .get(`/profile/${userId}`)
      .expect(HttpStatus.UNAUTHORIZED)
      .end(done);
  });

  it('should update the user profile', done => {
    request
      .put(`/profile/${userId}`)
      .send({
        name: faker.name.findName(),
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        expect(resp.body).not.toHaveProperty('password');
        return done();
      });
  });

  it('should require the name when update profile', done => {
    request
      .put(`/profile/${userId}`)
      .send({
        email: faker.internet.exampleEmail(),
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.BAD_REQUEST)
      .end(done);
  });

  it('should fail to update the profile without authorization', done => {
    request
      .put(`/profile/${userId}`)
      .send({
        name: faker.name.findName(),
      })
      .expect(HttpStatus.UNAUTHORIZED)
      .end(done);
  });
});
