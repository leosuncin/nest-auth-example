import {
  All,
  Controller,
  HttpStatus,
  type INestApplication,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Request as Req } from 'express';
import * as session from 'express-session';
import * as request from 'supertest';
import { createMock } from 'ts-auto-mock';

import type { User } from '../../user/user.entity';
import { AuthService } from '../auth.service';
import { SessionSerializer } from '../session.serializer';
import { LocalStrategy } from '../strategies/local.strategy';
import { LocalAuthGuard } from './local-auth.guard';

@Controller()
class TestController {
  @All()
  endpoint(@Request() req: Req) {
    return req.user;
  }
}

describe('LocalAuthGuard', () => {
  let app: INestApplication;
  let mockedAuthService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ session: true })],
      controllers: [TestController],
      providers: [
        LocalStrategy,
        SessionSerializer,
        {
          provide: APP_GUARD,
          useClass: LocalAuthGuard,
        },
      ],
    })
      .useMocker(token => {
        if (Object.is(token, AuthService)) {
          return createMock<AuthService>();
        }
      })
      .compile();

    mockedAuthService = module.get(AuthService);
    app = module.createNestApplication();
    app.use(
      session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
      }),
    );

    await app.init();
  });

  it('should authenticate using email and password', async () => {
    mockedAuthService.login.mockResolvedValueOnce(
      createMock<User>({
        email: 'john@doe.me',
        id: 1,
        name: 'John Doe ',
      }),
    );

    await request(app.getHttpServer())
      .post('/')
      .send({ email: 'john@doe.me', password: 'Pa$$w0rd' })
      .expect(HttpStatus.OK)
      .expect(({ headers }) => {
        expect(headers['set-cookie'][0]).toEqual(
          expect.stringContaining('connect.sid'),
        );
      });
  });

  it('should not authenticate when email and password are missing', async () => {
    mockedAuthService.login.mockRejectedValueOnce(new UnauthorizedException());

    await request(app.getHttpServer()).get('/').expect(HttpStatus.UNAUTHORIZED);
  });
});
