import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from 'ts-auto-mock';
import { EntityNotFoundError, type Repository } from 'typeorm';

import type { User } from '../../user/entities/user.entity';
import { PaginationQuery } from '../dtos/pagination-query.dto';
import type { TodoCreate } from '../dtos/todo-create.dto';
import type { TodoUpdate } from '../dtos/todo-update.dto';
import { Todo } from '../entities/todo.entity';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let mockedTodoRepository: jest.Mocked<Repository<Todo>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService],
    })
      .useMocker(token => {
        if (Object.is(token, getRepositoryToken(Todo))) {
          return createMock<Repository<Todo>>();
        }
      })
      .compile();

    service = module.get<TodoService>(TodoService);
    mockedTodoRepository = module.get(getRepositoryToken(Todo));
  });

  it('should be an instanceof TodoService', () => {
    expect(service).toBeInstanceOf(TodoService);
  });

  it('should create a new todo', async () => {
    const newTodo: TodoCreate = {
      text: 'Make an appointment',
      owner: createMock<User>(),
    };

    mockedTodoRepository.save.mockResolvedValueOnce(
      createMock<Todo>({
        text: newTodo.text,
        done: false,
      }),
    );
    const todo = await service.createTodo(newTodo);

    expect(todo).toBeDefined();
    expect(todo).toHaveProperty('text', newTodo.text);
    expect(todo).toHaveProperty('done', false);
  });

  it('should list all todo', async () => {
    const owner = createMock<User>({ id: 1 });
    const [todos, count] = await service.listTodo(new PaginationQuery(), owner);

    expect(Array.isArray(todos)).toBe(true);
    expect(count).toEqual(expect.any(Number));
  });

  it('should get one todo', async () => {
    const id = 1;

    mockedTodoRepository.findOneOrFail.mockResolvedValueOnce(
      createMock<Todo>({ owner: 1 }),
    );
    const todo = await service.getTodo(id);

    expect(todo).toBeDefined();
  });

  it('should throw on get one when the todo not exist', async () => {
    const id = 0;

    mockedTodoRepository.findOneOrFail.mockRejectedValueOnce(
      new EntityNotFoundError(Todo, {
        where: { id },
        loadRelationIds: true,
      }),
    );

    await expect(service.getTodo(id)).rejects.toThrow(EntityNotFoundError);
  });

  it('should update one todo', async () => {
    const todo = createMock<Todo>();
    const updates: TodoUpdate = {
      done: true,
    };

    mockedTodoRepository.save.mockResolvedValueOnce(createMock<Todo>(updates));
    await expect(service.updateTodo(todo, updates)).resolves.toHaveProperty(
      'done',
      updates.done,
    );
  });

  it('should remove a todo', async () => {
    const todo = createMock<Todo>();

    await expect(service.removeTodo(todo)).resolves.toBeDefined();
  });
});
