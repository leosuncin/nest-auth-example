import { build, fake } from '@jackfranklin/test-data-bot';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as supertest from 'supertest';

import { AppModule } from '../src/app.module';

const createTodoBuilder = build({
  fields: {
    text: fake(f => f.lorem.sentence()),
  },
});

describe('TodoController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
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
        },
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    await app.init();

    request = supertest(app.getHttpServer());

    const {
      header: { authorization },
    } = await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@doe.me', password: 'Pa$$w0rd' });
    [, token] = authorization.split(/\s+/);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should require authentication', async () => {
    await request
      .get('/todo')
      .send(createTodoBuilder())
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should create a new todo', async () => {
    const payload = createTodoBuilder();
    const resp = await request
      .post('/todo')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(HttpStatus.CREATED);

    expect(resp.body).toHaveProperty('text', payload.text);
    expect(resp.body).toHaveProperty('done', false);
  });

  it('should fail to create with invalid body', async () => {
    const resp = await request
      .post('/todo')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect('Content-Type', /json/);

    expect(resp.body).toHaveProperty('error', 'Unprocessable Entity');
  });

  it('should list all todos that belong to user', async () => {
    const resp = await request
      .get('/todo')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /json/);

    expect(Array.isArray(resp.body)).toBe(true);
  });
});
