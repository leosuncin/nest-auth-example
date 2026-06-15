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
import { mock } from '@suites/doubles.jest';
import type { Request as Req } from 'express';
import session from 'express-session';
import request from 'supertest';

import type { User } from '../../user/entities/user.entity';
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

  it('should authenticate using email and password', async () => {
    mockedAuthService.login.mockResolvedValueOnce({
      email: 'john@doe.me',
      id: 1,
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

  it('should not authenticate when email and password are missing', async () => {
    mockedAuthService.login.mockRejectedValueOnce(new UnauthorizedException());

    await request(app.getHttpServer()).get('/').expect(HttpStatus.UNAUTHORIZED);
  });
});
