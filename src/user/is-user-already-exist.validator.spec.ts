import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { useContainer, validate, Validate } from 'class-validator';
import { createMock } from 'ts-auto-mock';
import type { FindOptionsWhere, Repository } from 'typeorm';

import { IsUserAlreadyExist } from './is-user-already-exist.validator';
import { User } from './user.entity';

class UserDTO {
  @Validate(IsUserAlreadyExist)
  readonly email: string;

  constructor(email: string) {
    this.email = email;
  }
}

describe('IsUserAlreadyExist', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsUserAlreadyExist],
    })
      .useMocker(token => {
        if (Object.is(token, getRepositoryToken(User))) {
          return createMock<Repository<User>>({
            findOneBy: jest
              .fn()
              .mockImplementation((where: FindOptionsWhere<User>) => {
                if (where.email === 'john@doe.me') {
                  return createMock<User>();
                }
              }),
          });
        }
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it.each([
    ['john@doe.me', 1],
    ['newuser@example.com', 0],
  ])(
    'should validate whether the user already exist by their email',
    async (email, errors) => {
      const user = new UserDTO(email);

      await expect(validate(user)).resolves.toHaveLength(errors);
    },
  );
});
