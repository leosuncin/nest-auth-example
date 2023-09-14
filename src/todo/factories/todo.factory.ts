import { setSeederFactory } from 'typeorm-extension';

import { Todo } from '../entities/todo.entity';

export const todoFactory = setSeederFactory(Todo, faker => {
  const todo = new Todo();
  todo.text = faker.lorem.sentence();
  todo.done = faker.datatype.boolean();

  return todo;
});
