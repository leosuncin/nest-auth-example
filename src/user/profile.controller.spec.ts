import { build, fake, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ProfileController } from './profile.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

const userBuilder = build('User', {
  fields: {
    id: sequence(),
    name: fake(f => f.name.findName()),
    email: fake(f => f.internet.exampleEmail()),
    password: fake(f => f.random.uuid()),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
});
const updateBuilder = build('UserUpdate', {
  fields: {
    name: fake(f => f.name.findName()),
  },
});

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

              return Promise.resolve(test ? userBuilder() : null);
            },
            save(dto) {
              return Promise.resolve(userBuilder({ overrides: dto }));
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

  it('should update a profile', () =>
    expect(controller.update(1, updateBuilder())).resolves.toBeDefined());

  it('should fail to update a profile', () =>
    expect(controller.update(0, updateBuilder())).rejects.toBeDefined());
});
