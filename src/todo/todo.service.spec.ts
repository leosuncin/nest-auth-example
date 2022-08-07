import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from 'ts-auto-mock';
import type { Repository } from 'typeorm';

import type { User } from '../user/user.entity';
import type { TodoCreate } from './todo-create.dto';
import type { TodoUpdate } from './todo-update.dto';
import { Todo } from './todo.entity';
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
    const todos = await service.listTodo(owner);

    expect(Array.isArray(todos)).toBe(true);
  });

  it('should get one todo', async () => {
    const id = 1;
    const owner = createMock<User>({ id: 1 });

    mockedTodoRepository.findOne.mockResolvedValueOnce(
      createMock<Todo>({ owner: 1 }),
    );
    const todo = await service.getTodo(id, owner);

    expect(todo).toBeDefined();
  });

  it('should throw on get one when the todo not exist', async () => {
    const id = 0;
    const owner = createMock<User>({ id: 1 });

    mockedTodoRepository.findOne.mockResolvedValueOnce(undefined);

    await expect(
      service.getTodo(id, owner),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Not found any todo with id: 0"`,
    );
  });

  it('should throw on get one when the todo is from other user', async () => {
    const id = 2;
    const owner = createMock<User>({ id: 1 });

    mockedTodoRepository.findOne.mockResolvedValueOnce(
      createMock<Todo>({ id, owner: id }),
    );

    await expect(
      service.getTodo(id, owner),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Todo does not belong to you"`,
    );
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
