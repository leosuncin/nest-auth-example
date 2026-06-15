import type { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';

import type { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('Auth Controller', () => {
  let controller: AuthController;
  let mockedAuthService: Mocked<AuthService>;
  const user = {
    name: 'John Doe',
    email: 'john@doe.me',
  } as User;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthController).compile();

    controller = unit;
    mockedAuthService = unitRef.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const register = {
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    };

    mockedAuthService.register.mockResolvedValue({
      email: register.email,
      name: register.name,
    } as User);

    await expect(controller.register(register)).resolves.toBeDefined();
  });

  it('should log in an user', () => {
    expect(controller.login(user)).toBeDefined();
  });

  it('should got me logged', () => {
    expect(controller.me(user)).toEqual(user);
  });
});
