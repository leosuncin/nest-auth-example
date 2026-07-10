import { getRepositoryToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import type { Repository } from 'typeorm';

import type { SignUp } from '../dto/sign-up.dto';
import type { UserUpdate } from '../dto/user-update.dto';
import { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';

describe('Auth Controller', () => {
  const user = new User({
    name: 'John Doe',
    email: 'john@doe.me',
  });
  let controller: AuthController;
  let repository: Mocked<Repository<User>>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.sociable(AuthController)
      .expose(AuthService)
      .compile();

    controller = unit;
    repository = unitRef.get(
      getRepositoryToken(User) as string
    ) as unknown as Mocked<Repository<User>>;
  });

  it('given the register is called when valid sign-up data is passed then it returns a user', async () => {
    const register: SignUp = {
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    };

    repository.create.mockReturnValue(new User(register));
    repository.save.mockResolvedValue(new User(register));

    await expect(controller.register(register)).resolves.toBeDefined();
  });

  it('given the login is called when an authenticated user is passed then it returns the user', () => {
    expect(controller.login(user)).toBeDefined();
  });

  it('given the me is called when an authenticated user is passed then it returns the same user', () => {
    expect(controller.me(user)).toEqual(user);
  });

  it('given the updateMe is called when a user and the changes are passed then it returns the updated user', async () => {
    const changes: UserUpdate = {
      id: 'efaa424b-9cec-4ec4-9326-e57088643abc',
      email: 'john.doe@example.me',
      name: 'John Doe',
      password: 'Pa$$w0rd',
    };

    const updatedUser = new User({
      ...user,
      ...changes,
    });

    repository.merge.mockImplementation(Object.assign);
    repository.save.mockResolvedValue(updatedUser);

    await expect(controller.updateMe(user, changes)).resolves.toEqual(
      updatedUser
    );
  });
});
