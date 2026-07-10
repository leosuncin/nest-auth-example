import { getRepositoryToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import { EntityNotFoundError, type Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { PaginationQuery } from '../dtos/pagination-query.dto';
import type { TodoCreate } from '../dtos/todo-create.dto';
import type { TodoUpdate } from '../dtos/todo-update.dto';
import { Todo } from '../entities/todo.entity';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let mockedTodoRepository: Mocked<Repository<Todo>>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(TodoService).compile();

    service = unit;
    mockedTodoRepository = unitRef.get(
      getRepositoryToken(Todo) as string
    ) as unknown as Mocked<Repository<Todo>>;
  });

  it('given the createTodo is called when the data is passed then it creates a todo', async () => {
    const newTodo: TodoCreate = {
      text: 'Make an appointment',
      owner: {} as User,
    };

    mockedTodoRepository.save.mockResolvedValueOnce({
      text: newTodo.text,
      done: false,
    } as Todo);
    const todo = await service.createTodo(newTodo);

    expect(todo).toBeDefined();
    expect(todo).toHaveProperty('text', newTodo.text);
    expect(todo).toHaveProperty('done', false);
  });

  it('given the listTodo is called when the data is the default then it returns todos and count', async () => {
    const owner = new User({ id: 'ef5559a5-c6aa-4433-9394-52d190331db1' });
    mockedTodoRepository.findAndCount.mockResolvedValueOnce([[], 0]);
    const [todos, count] = await service.listTodo(new PaginationQuery(), owner);

    expect(Array.isArray(todos)).toBe(true);
    expect(count).toEqual(expect.any(Number));
  });

  it('given getTodo is called when an existing todo id is passed then it returns the todo', async () => {
    const id = 'ed2dc10f-b23c-4e3d-8bd2-4e9162b3f5a8';

    mockedTodoRepository.findOneOrFail.mockResolvedValueOnce(
      new Todo({
        id,
        owner: 'ef5559a5-c6aa-4433-9394-52d190331db1',
      })
    );
    const todo = await service.getTodo(id);

    expect(todo).toBeDefined();
  });

  it('given getTodo is called when a non-existing todo id is passed then it throws', async () => {
    const id = 'a0ebdb41-b962-4f01-a2c5-4a9bfe4ae6e9';

    mockedTodoRepository.findOneOrFail.mockRejectedValueOnce(
      new EntityNotFoundError(Todo, {
        where: { id },
        loadRelationIds: true,
      })
    );

    await expect(service.getTodo(id)).rejects.toThrow(EntityNotFoundError);
  });

  it('given updateTodo is called when the todo exists and the changes are passed then it returns the updated todo', async () => {
    const todo = new Todo();
    const updates: TodoUpdate = {
      done: true,
    };

    mockedTodoRepository.save.mockResolvedValueOnce(updates as Todo);
    await expect(service.updateTodo(todo, updates)).resolves.toHaveProperty(
      'done',
      updates.done
    );
  });

  it('given removeTodo is called when the todo exists then it removes and returns the todo', async () => {
    const todo = {} as Todo;

    mockedTodoRepository.remove.mockResolvedValueOnce(todo);
    await expect(service.removeTodo(todo)).resolves.toBeDefined();
  });
});
