import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type Mocked, mock } from '@suites/doubles.jest';
import { useContainer, Validate, validate } from 'class-validator';
import type { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { IsUserAlreadyExist } from './is-user-already-exist.validator';

class UserDTO {
  @Validate(IsUserAlreadyExist)
  readonly email: string;

  constructor(email: string) {
    this.email = email;
  }
}

describe('IsUserAlreadyExist', () => {
  let mockedUserRepository: Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsUserAlreadyExist,
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });

    mockedUserRepository = module.get(getRepositoryToken(User));
  });

  it.each([
    ['john@doe.me', 1],
    ['newuser@example.com', 0],
  ])('should validate whether the user already exist by their email', async (email, errors) => {
    const user = new UserDTO(email);

    mockedUserRepository.findOneBy.mockResolvedValueOnce(
      email === 'john@doe.me' ? ({} as User) : null
    );

    await expect(validate(user)).resolves.toHaveLength(errors);
  });
});
