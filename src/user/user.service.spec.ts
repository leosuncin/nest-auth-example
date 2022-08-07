import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from 'ts-auto-mock';
import type { Repository } from 'typeorm';

import { User } from './user.entity';
import type { UserUpdate } from './dto/user-update.dto';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockedUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    })
      .useMocker(token => {
        if (Object.is(token, getRepositoryToken(User))) {
          return createMock<Repository<User>>();
        }
      })
      .compile();

    service = module.get<UserService>(UserService);
    mockedUserRepository = module.get(getRepositoryToken(User));
  });

  it('should be an instanceof UserService', () => {
    expect(service).toBeInstanceOf(UserService);
  });

  it('should create a new user', async () => {
    const data = {
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    };

    mockedUserRepository.save.mockResolvedValueOnce(createMock<User>(data));
    const user = await service.create(data);

    expect(user).toBeDefined();
  });

  it('should find one user', async () => {
    const email = 'john@doe.me';

    mockedUserRepository.findOne.mockResolvedValueOnce(
      createMock<User>({ email }),
    );
    const user = await service.findOne({ where: { email } });

    expect(user).toBeDefined();
    expect(user).toHaveProperty('email', 'john@doe.me');
  });

  it('should throw on find one when the user not exist', async () => {
    mockedUserRepository.findOne.mockResolvedValueOnce(undefined);

    await expect(
      service.findOne({ where: { email: 'notexisting@example.com' } }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"There isn't any user with identifier: [object Object]"`,
    );
  });

  it('should update an user', async () => {
    const id = 1;
    const updates: UserUpdate = {
      name: 'Jhonny Doe',
    };

    mockedUserRepository.save.mockResolvedValueOnce(createMock<User>(updates));
    const user = await service.update(id, updates);

    expect(user).toBeDefined();
    expect(user).toHaveProperty('name', updates.name);
  });

  it('should throw on update when the user not exist', async () => {
    const id = 0;
    const updates: UserUpdate = {
      name: 'Jhonny Doe',
    };
    mockedUserRepository.findOneBy.mockResolvedValueOnce(undefined);

    await expect(
      service.update(id, updates),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"There isn't any user with id: 0"`,
    );
  });
});
