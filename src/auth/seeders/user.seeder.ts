import type { DataSource } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '../entities/user.entity';

export const john = new User({
  id: '019ede05-8553-714a-8110-8446cfbf70e4',
  name: 'John Doe',
  email: 'john.doe@example.me',
  password: 'Pa$$w0rd',
  createdAt: new Date(1_781_841_364_307),
  updatedAt: new Date(1_781_841_364_307),
});

export const jane = new User({
  id: '019ede05-be58-763f-87b6-ba617a09cbd5',
  name: 'Jane Doe',
  email: 'jane.doe@example.me',
  password: 'Pa$$w0rd',
  createdAt: new Date(1_781_841_378_904),
  updatedAt: new Date(1_781_841_378_904),
});

export class UserSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const userFactory = factoryManager.get(User);
    const userRepository = dataSource.getRepository(User);

    await userRepository.save(john);
    await userRepository.save(jane);
    await userFactory.saveMany(5);
  }
}
