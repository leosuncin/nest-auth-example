import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { TodoCreate } from '../dtos/todo-create.dto';

export const TodoCreateFactory = FactoryBuilder.of(TodoCreate)
  .props({
    text: () => faker.hacker.phrase(),
  })
  .build();
