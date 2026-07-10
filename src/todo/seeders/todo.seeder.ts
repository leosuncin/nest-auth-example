import type { DataSource } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { jane, john } from '../../auth/seeders/user.seeder';
import { Todo } from '../entities/todo.entity';

export const johnTodo = new Todo({
  id: '019ede08-9e4d-7d1d-bb0b-24362f13ae1f',
  text: 'Make a sandwich',
  done: false,
  owner: john,
  createdAt: new Date(1_781_841_567_309),
  updatedAt: new Date(1_781_841_567_309),
});

export const janeTodo = new Todo({
  id: '019ede17-2090-7408-b827-43046b608ccd',
  text: 'Make a salad',
  done: false,
  owner: jane,
  createdAt: new Date(1_781_842_518_160),
  updatedAt: new Date(1_781_842_518_160),
});

export class TodoSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const todoRepository = dataSource.getRepository(Todo);
    const todoFactory = factoryManager.get(Todo);

    await todoRepository.save(johnTodo);
    await todoRepository.save(janeTodo);
    await todoFactory.saveMany(30, { owner: john });
    await todoFactory.saveMany(100, { owner: jane });
  }
}
