import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as faker from 'faker';

import { ProfileController } from './profile.controller';
import { UserService } from './user.service';
import { User } from './user.entity';

describe('Profile Controller', () => {
  let controller: ProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
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
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('should get a profile', () =>
    expect(controller.get(1)).resolves.toBeDefined());

  it('should fail to get a profile', () =>
    expect(controller.get(0)).rejects.toThrow());

  it('should update a profile', () => {
    const data = { name: faker.fake('{{name.firstName}} name.lastName') };

    return expect(controller.update(1, data)).resolves.toBeDefined();
  });

  it('should fail to update a profile', () => {
    const data = { name: faker.fake('{{name.firstName}} name.lastName') };

    return expect(controller.update(0, data)).rejects.toBeDefined();
  });
});
