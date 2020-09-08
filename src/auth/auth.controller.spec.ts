import { build, fake, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as httpMocks from 'node-mocks-http';
import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';

import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const userBuilder = build<Partial<User>>({
  fields: {
    id: sequence(),
    name: fake(f => f.name.findName()),
    email: fake(f => f.internet.exampleEmail()),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
  postBuild: u => new User(u),
});

describe('Auth Controller', () => {
  let controller: AuthController;
  const repositoryMock = mock<Repository<User>>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
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
    repositoryMock.save.mockResolvedValueOnce(
      userBuilder({ overrides: register }) as User,
    );

    await expect(controller.register(register, resp)).resolves.toBeDefined();
    expect(resp._getHeaders()).toHaveProperty(
      'authorization',
      'Bearer 6a6f686e40646f652e6d65',
    );
    expect(resp._getData()).not.toHaveProperty('password');
  });

  it('should log in an user', async () => {
    expect.assertions(3);
    const resp = httpMocks.createResponse();
    const user = userBuilder({
      overrides: {
        name: 'John Doe',
        email: 'john@doe.me',
      },
    });

    await expect(controller.login(user as User, resp)).resolves.toBeDefined();
    expect(resp._getHeaders()).toHaveProperty(
      'authorization',
      'Bearer 6a6f686e40646f652e6d65',
    );
    expect(resp._getData()).not.toHaveProperty('password');
  });

  it('should got me logged', () => {
    const user = userBuilder({
      overrides: {
        name: 'John Doe',
        email: 'john@doe.me',
      },
    });

    expect(controller.me(user as User)).toEqual(user);
  });
});
