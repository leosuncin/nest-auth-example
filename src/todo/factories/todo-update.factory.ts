import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { TodoUpdate } from '../dtos/todo-update.dto';

export const TodoUpdateFactory = FactoryBuilder.of(TodoUpdate)
  .props({
    done: () => faker.datatype.boolean(),
  })
  .build();
