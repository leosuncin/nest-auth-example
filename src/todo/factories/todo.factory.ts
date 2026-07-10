import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';
import { setSeederFactory } from 'typeorm-extension';

import { Todo } from '../entities/todo.entity';

export const TodoFactory = FactoryBuilder.of(Todo)
  .props({
    text: () => faker.lorem.sentence(),
    done: () => faker.datatype.boolean(),
  })
  .build();

export const todoFactory = setSeederFactory(
  Todo,
  (faker) =>
    new Todo({
      text: faker.lorem.sentence(),
      done: faker.datatype.boolean(),
    })
);
