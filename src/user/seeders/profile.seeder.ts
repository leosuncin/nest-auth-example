import { type DataSource } from 'typeorm';
import { Seeder, type SeederFactoryManager } from 'typeorm-extension';

import { Profile } from '../entities/profile.entity';
import { User } from '../entities/user.entity';

export class ProfileSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const profileFactory = factoryManager.get(Profile);

    await profileFactory.save({
      id: 1,
      phone: '(802) 698-1134',
      birthday: new Date(1981, 9, 2), // 2 Oct 1981
      user: await userRepository.findOneOrFail({ where: { email: 'john@doe.me' } }),
    });
    await profileFactory.save({
      id: 2,
      phone: '(802) 798-1134',
      birthday: new Date(1982, 9, 12), // 12 Oct 1982
      user: await userRepository.findOneOrFail({ where: { email: 'jane@doe.me' } }),
    });
  }
}
