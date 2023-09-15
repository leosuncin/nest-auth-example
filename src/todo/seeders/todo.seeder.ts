import { type DataSource } from 'typeorm';
import { Seeder, type SeederFactoryManager } from 'typeorm-extension';

import { Todo } from '../entities/todo.entity';
import { User } from '../../user/entities/user.entity';

export class TodoSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const todoFactory = factoryManager.get(Todo);
    const john = await userRepository.findOneOrFail({ where: { email: 'john@doe.me' } });
    const jane = await userRepository.findOneOrFail({ where: { email: 'jane@doe.me' } });

    await todoFactory.save({
      id: 1,
      text: 'Make a sandwich',
      done: false,
      owner: john,
    });
    await todoFactory.save({
      id: 2,
      text: 'Make a salad',
      done: false,
      owner: jane,
    });
    await todoFactory.saveMany(10, { owner: john });
    await todoFactory.saveMany(100, { owner: jane });
  }
}
