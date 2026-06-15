import { getRepositoryToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import type { Repository } from 'typeorm';

import type { UserUpdate } from '../dto/user-update.dto';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockedUserRepository: Mocked<Repository<User>>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();

    service = unit;
    mockedUserRepository = unitRef.get(getRepositoryToken(User) as string);
  });

  it('should be an instanceof UserService', () => {
    expect(service).toBeInstanceOf(UserService);
  });

  it('should create a new user', async () => {
    const data = {
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    } as User;

    mockedUserRepository.save.mockResolvedValueOnce(data);
    const user = await service.create(data);

    expect(user).toBeDefined();
  });

  it('should find one user', async () => {
    const email = 'john@doe.me';

    mockedUserRepository.findOne.mockResolvedValueOnce({ email } as User);
    const user = await service.findOne({ where: { email } });

    expect(user).toBeDefined();
    expect(user).toHaveProperty('email', 'john@doe.me');
  });

  it('should throw on find one when the user not exist', async () => {
    mockedUserRepository.findOne.mockResolvedValueOnce(null);

    await expect(
      service.findOne({ where: { email: 'notexisting@example.com' } })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"There isn't any user with identifier: [object Object]"`
    );
  });

  it('should update an user', async () => {
    const id = 1;
    const updates: UserUpdate = {
      name: 'Jhonny Doe',
    };

    mockedUserRepository.findOneBy.mockResolvedValueOnce({ id } as User);
    mockedUserRepository.save.mockResolvedValueOnce({ ...updates, id } as User);
    const user = await service.update(id, updates);

    expect(user).toBeDefined();
    expect(user).toHaveProperty('name', updates.name);
  });

  it('should throw on update when the user not exist', async () => {
    const id = 0;
    const updates: UserUpdate = {
      name: 'Jhonny Doe',
    };
    mockedUserRepository.findOneBy.mockResolvedValueOnce(null);

    await expect(
      service.update(id, updates)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"There isn't any user with id: 0"`
    );
  });
});
