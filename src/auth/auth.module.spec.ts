import { fc, it } from '@fast-check/vitest';
import { HttpStatus, type INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { runSeeders } from 'typeorm-extension';

import { AppModule } from '../app.module';
import dataSource from '../config/data-source';
import dataSourceTest from '../config/data-source-pglite';
import { setup } from '../setup';
import { signUpFactory } from './factories/sign-up.factory';
import { AuthService } from './services/auth.service';

const bearerTokenRegex = /Bearer .+\..+\..+/;

describe('AuthModule (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(dataSourceTest.asProvider()),
        AppModule,
      ],
    })
      .overrideProvider(dataSource.KEY)
      .useValue(dataSourceTest())
      .compile();

    app = setup(module.createNestApplication());

    await app.init();
  });

  beforeEach(async () => {
    await runSeeders(app.get(getDataSourceToken()), { seedTracking: true });
  });

  afterAll(async () => {
    await app.close();
  });

  test('given a POST request to /auth/register when the payload is valid then it creates a new user', async () => {
    const data = signUpFactory.buildOne();
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(HttpStatus.CREATED)
      .expect('authorization', bearerTokenRegex);

    expect(response.body).not.toHaveProperty('password');
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: data.email,
      name: data.name,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('given a POST request to /auth/register when the payload contains a registered email then it prevents to create a duplicated user', async () => {
    const data = signUpFactory.buildOne({ email: 'john.doe@example.me' });
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "error": "Unprocessable Entity",
        "message": [
          "email «john.doe@example.me» is already registered",
        ],
        "statusCode": 422,
      }
    `);
  });

  it.prop({
    email: fc.emailAddress(),
    name: fc.string(),
    password: fc.string({ maxLength: 7 }),
  })(
    'given a POST request to /auth/register when the payload is invalid then it prevents to create a new user',
    async (data) => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(data)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toHaveProperty(
        'message',
        expect.arrayContaining([expect.any(String)])
      );
    }
  );

  test('given a POST request to /auth/login when the credentials are valid then it authenticates it', async () => {
    const data = {
      email: 'john.doe@example.me',
      password: 'Pa$$w0rd',
    };
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.OK)
      .expect('authorization', bearerTokenRegex);

    expect(response.body).not.toHaveProperty('password');
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: data.email,
      name: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('given a POST request to /auth/login when the email is invalid then it refuse to authenticate it', async () => {
    const data = signUpFactory.buildOne({ name: undefined });
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "message": "There isn't any user with email: ${data.email}",
        "statusCode": 401,
      }
    `);
  });

  test('given a POST request to /auth/login when the password is invalid then it refuse to authenticate it', async () => {
    const data = signUpFactory.buildOne({
      name: undefined,
      email: 'john.doe@example.me',
    });
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "error": "Unauthorized",
        "message": "Wrong password for user with email: john.doe@example.me",
        "statusCode": 401,
      }
    `);
  });

  test('given a GET request to /auth/me when the user is authenticated then it respond with its data', async () => {
    const token = app
      .get(AuthService)
      // @ts-expect-error Testing token
      .signToken({ email: 'john.doe@example.me' });
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(response.body).not.toHaveProperty('password');
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: 'john.doe@example.me',
      name: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('given a GET request to /auth/me when the user is not authenticated then it does not get the user info', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "message": "Unauthorized",
        "statusCode": 401,
      }
    `);
  });

  test('given a PUT request to /auth/me when the user is authenticated then it updates their information', async () => {
    const token = app
      .get(AuthService)
      // @ts-expect-error Testing token
      .signToken({ email: 'john.doe@example.me' });
    const data = signUpFactory.buildOne({ email: 'john.doe@example.me' });
    const response = await request(app.getHttpServer())
      .put('/auth/me')
      .set('authorization', `Bearer ${token}`)
      .send(data)
      .expect(HttpStatus.OK)
      .expect('authorization', bearerTokenRegex);

    expect(response.body).not.toHaveProperty('password');
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: data.email,
      name: data.name,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('given a PUT request to /auth/me when the user is not authenticated then it does not update', async () => {
    const data = signUpFactory.buildOne();
    const response = await request(app.getHttpServer())
      .put('/auth/me')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "message": "Unauthorized",
        "statusCode": 401,
      }
    `);
  });

  it.prop({
    email: fc.uuid(),
    name: fc.string(),
    password: fc.ulid(),
  })(
    'given a PUT request to /auth/me when the payload is invalid then it does not update',
    async (data) => {
      const token = app
        .get(AuthService)
        // @ts-expect-error Testing token
        .signToken({ email: 'john.doe@example.me' });
      const response = await request(app.getHttpServer())
        .put('/auth/me')
        .set('authorization', `Bearer ${token}`)
        .send(data)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toHaveProperty(
        'message',
        expect.arrayContaining([expect.any(String)])
      );
    }
  );
});
