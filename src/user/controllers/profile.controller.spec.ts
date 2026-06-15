import type { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import type { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { ProfileController } from './profile.controller';

describe('Profile Controller', () => {
  let controller: ProfileController;
  let mockedUserService: Mocked<UserService>;

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(ProfileController).compile();

    controller = unit;
    mockedUserService = unitRef.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a profile', async () => {
    mockedUserService.findOne.mockResolvedValueOnce({} as User);

    await expect(controller.get(1)).resolves.toBeDefined();
  });

  it('should update a profile', async () => {
    const updatesUser = {
      name: 'Johnny Doe',
    };

    mockedUserService.update.mockResolvedValueOnce({
      name: updatesUser.name,
    } as User);

    await expect(controller.update(1, updatesUser)).resolves.toBeDefined();
  });
});
