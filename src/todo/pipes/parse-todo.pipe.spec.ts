import { getRepositoryToken } from '@nestjs/typeorm';
import { TestBed } from '@suites/unit';
import {
  EntityNotFoundError,
  type FindOneOptions,
  type FindOptionsWhere,
} from 'typeorm';
import { Todo } from '../entities/todo.entity';
import { johnTodo } from '../seeders/todo.seeder';
import { TodoService } from '../services/todo.service';
import { ParseTodoPipe } from './parse-todo.pipe';

describe('ParseTodoPipe', () => {
  let pipe: ParseTodoPipe;

  beforeEach(async () => {
    const { unit } = await TestBed.sociable(ParseTodoPipe)
      .expose(TodoService)
      .mock(getRepositoryToken(Todo) as string)
      .final({
        findOneOrFail(args: FindOneOptions<Todo>) {
          const { promise, resolve, reject } = Promise.withResolvers<Todo>();

          if ((args.where as FindOptionsWhere<Todo>).id === johnTodo.id) {
            resolve(johnTodo);
          } else {
            reject(new EntityNotFoundError(Todo, args));
          }

          return promise;
        },
      })
      .compile();

    pipe = unit;
  });

  it('given the pipe is executed when the value is an id of an existing todo then it transform it to a todo', async () => {
    await expect(pipe.transform(johnTodo.id)).resolves.toStrictEqual(johnTodo);
  });

  it('given the pipe is executed when value is a non-existing todo id then it throws EntityNotFoundError', async () => {
    await expect(
      pipe.transform('00000000-0000-0000-0000-000000000000')
    ).rejects.toThrow(EntityNotFoundError);
  });
});
