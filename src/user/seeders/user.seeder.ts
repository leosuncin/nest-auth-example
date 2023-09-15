import { type DataSource } from 'typeorm';
import { Seeder, type SeederFactoryManager } from 'typeorm-extension';

import { User } from '../entities/user.entity';

export class UserSeeder implements Seeder {
  public async run(
    _: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userFactory = factoryManager.get(User);

    await userFactory.save({
      id: 1,
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    });
    await userFactory.save({
      id: 2,
      name: 'Jane Doe',
      email: 'jane@doe.me',
      password: 'Pa$$w0rd',
    });
    await userFactory.saveMany(5);
  }
}
