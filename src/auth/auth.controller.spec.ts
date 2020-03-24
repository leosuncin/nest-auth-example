import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as httpMocks from 'node-mocks-http';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

describe('Auth Controller', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            count({ email }) {
              return Promise.resolve(email ? 0 : 1);
            },
            findOne(options: any) {
              const test = Number.isFinite(options)
                ? Boolean(options)
                : Boolean(options.where.id);
              return Promise.resolve(test ? new User() : null);
            },
            save(dto) {
              return Promise.resolve(dto);
            },
          },
        },
        {
          provide: 'JwtService',
          useValue: {
            sign(payload) {
              return payload.sub
                .split('')
                .reduce(
                  (prev, current) => prev + current.charCodeAt(0).toString(16),
                  '',
                );
            },
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    expect.assertions(3);
    const register = {
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    };
    const resp = httpMocks.createResponse();

    expect(await controller.register(register, resp)).toBeDefined();
    expect(resp._getHeaders()).toHaveProperty(
      'authorization',
      'Bearer 6a6f686e40646f652e6d65',
    );
    expect(resp._getData()).not.toHaveProperty('password');
  });

  it('should log in an user', async () => {
    expect.assertions(3);
    const req = httpMocks.createRequest();
    const resp = httpMocks.createResponse();
    req.user = {
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    };

    expect(await controller.login(req, resp)).toBeDefined();
    expect(resp._getHeaders()).toHaveProperty(
      'authorization',
      'Bearer 6a6f686e40646f652e6d65',
    );
    expect(resp._getData()).not.toHaveProperty('password');
  });

  it('should got me logged', () => {
    const user = { id: 1, name: 'John Doe', email: 'john@doe.me' };

    expect(
      controller.me(
        httpMocks.createRequest({
          session: {
            passport: { user },
          },
        } as unknown),
      ),
    ).toEqual(user);
  });
});
