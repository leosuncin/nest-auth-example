import { build, fake, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';

import { ProfileController } from './profile.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

const userBuilder = build<Partial<User>>({
  fields: {
    id: sequence(),
    name: fake(f => f.name.findName()),
    email: fake(f => f.internet.exampleEmail()),
    password: fake(f => f.random.uuid()),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
  postBuild: u => new User(u),
});
const updateBuilder = build({
  fields: {
    name: fake(f => f.name.findName()),
  },
});

describe('Profile Controller', () => {
  let controller: ProfileController;
  const repositoryMock = mock<Repository<User>>();

  beforeEach(async () => {
    repositoryMock.save.mockImplementation((entity: any) =>
      Promise.resolve(userBuilder({ overrides: entity }) as User),
    );
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a profile', async () => {
    repositoryMock.findOne.mockResolvedValueOnce(
      userBuilder({ overrides: { id: 1 } }) as User,
    );

    await expect(controller.get(1)).resolves.toBeDefined();
  });

  it('should fail to get a profile', async () => {
    repositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(controller.get(0)).rejects.toThrow();
  });

  it('should update a profile', async () => {
    repositoryMock.findOne.mockResolvedValueOnce(
      userBuilder({ overrides: { id: 1 } }) as User,
    );

    await expect(controller.update(1, updateBuilder())).resolves.toBeDefined();
  });

  it('should fail to update a profile', async () => {
    repositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(controller.update(0, updateBuilder())).rejects.toBeDefined();
  });
});
