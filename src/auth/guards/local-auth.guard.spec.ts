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
import { Test } from '@nestjs/testing';
import { type Mocked, mock } from '@suites/doubles.vitest';
import type { Request as Req } from 'express';
import session from 'express-session';
import request from 'supertest';

import type { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';
import { SessionSerializer } from '../session.serializer';
import { LocalStrategy } from '../strategies/local.strategy';
import { LocalAuthGuard } from './local-auth.guard';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Controller()
class TestController {
  @All()
  endpoint(@Request() req: Req) {
    return req.user;
  }
}

describe('LocalAuthGuard', () => {
  let app: INestApplication;
  let mockedAuthService: Mocked<AuthService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({ session: true })],
      controllers: [TestController],
      providers: [
        LocalStrategy,
        SessionSerializer,
        {
          provide: APP_GUARD,
          useClass: LocalAuthGuard,
        },
        {
          provide: AuthService,
          useFactory: mock,
        },
      ],
    }).compile();

    mockedAuthService = module.get(AuthService);
    app = module.createNestApplication();
    app.use(
      session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
      })
    );

    await app.init();
  });

  it('given a guarded route when valid email and password are provided then it authenticates', async () => {
    mockedAuthService.login.mockResolvedValueOnce({
      email: 'john@doe.me',
      id: '0117ea43-9de9-4c09-b3e5-9f8c44b082bc',
      name: 'John Doe ',
    } as User);

    await request(app.getHttpServer())
      .post('/')
      .send({ email: 'john@doe.me', password: 'Pa$$w0rd' })
      .expect(HttpStatus.OK)
      .expect(({ headers }) => {
        expect(headers['set-cookie'][0]).toEqual(
          expect.stringContaining('connect.sid')
        );
      });
  });

  it('given a guarded route when missing email and password are provided then it rejects authentication', async () => {
    mockedAuthService.login.mockRejectedValueOnce(new UnauthorizedException());

    await request(app.getHttpServer()).get('/').expect(HttpStatus.UNAUTHORIZED);
  });
});
