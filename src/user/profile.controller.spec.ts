import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import { ProfileController } from './profile.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('Profile Controller', () => {
  let controller: ProfileController;
  let mockedUserService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
    })
    .useMocker((token) => {
      if (Object.is(token, UserService)) {
        return createMock<UserService>()
      }
    })
    .compile();

    controller = module.get<ProfileController>(ProfileController);
    mockedUserService = module.get<UserService, jest.Mocked<UserService>>(UserService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a profile', async () => {
    await expect(controller.get(1)).resolves.toBeDefined();
  });

  it('should update a profile', async () => {
    const updatesUser = {
      name: 'Johnny Doe'
    }

    mockedUserService.update.mockResolvedValueOnce(createMock<User>({ name: updatesUser.name }))

    await expect(controller.update(1, updatesUser)).resolves.toBeDefined();
  });
});
