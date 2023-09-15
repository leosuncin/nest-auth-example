import { Test, type TestingModule } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import type { User } from '../../user/entities/user.entity';
import { PaginationQuery } from '../dtos/pagination-query.dto';
import type { TodoCreate } from '../dtos/todo-create.dto';
import type { TodoUpdate } from '../dtos/todo-update.dto';
import type { Todo } from '../entities/todo.entity';
import { TodoService } from '../services/todo.service';
import { TodoController } from './todo.controller';

describe('Todo Controller', () => {
  let controller: TodoController;
  let mockedTodoService: jest.Mocked<TodoService>;
  const user = createMock<User>({ id: 1 });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
    })
      .useMocker(token => {
        if (Object.is(token, TodoService)) {
          return createMock<TodoService>();
        }
      })
      .compile();

    controller = module.get<TodoController>(TodoController);
    mockedTodoService = module.get(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new todo', async () => {
    const newTodo: TodoCreate = {
      text: 'Make a sandwich',
      owner: user,
    };

    mockedTodoService.createTodo.mockResolvedValue(createMock<Todo>(newTodo));

    await expect(controller.createTodo(newTodo, user)).resolves.toBeDefined();
  });

  it('should list all todos', async () => {
    const [todos, count] = await controller.listTodo(
      new PaginationQuery(),
      user,
    );

    expect(Array.isArray(todos)).toBe(true);
    expect(count).toEqual(expect.any(Number));
  });

  it('should get one todo', async () => {
    const id = 1;

    mockedTodoService.getTodo.mockResolvedValueOnce(createMock<Todo>({ id }));
    const todo = await controller.getTodo(id);

    expect(todo).toHaveProperty('id', id);
  });

  it('should update one todo', async () => {
    const updates: TodoUpdate = {
      done: true,
      text: 'Duis do labore enim in irure.',
    };

    mockedTodoService.updateTodo.mockResolvedValueOnce(
      createMock<Todo>(updates),
    );
    const todo = await controller.updateTodo(
      createMock<Todo>({ id: 1 }),
      updates,
    );

    expect(todo).toHaveProperty('done', updates.done);
    expect(todo).toHaveProperty('text', updates.text);
  });

  it('should remove one todo', async () => {
    const todo = createMock<Todo>({ id: 1 });

    await expect(controller.removeTodo(todo)).resolves.toBeDefined();
  });

  it('should mark todo as done', async () => {
    mockedTodoService.updateTodo.mockResolvedValueOnce(
      createMock<Todo>({ done: true }),
    );
    const todo = await controller.markTodoAsDone(
      createMock<Todo>({ id: 1, done: false }),
    );

    expect(todo).toHaveProperty('done', true);
  });

  it('should mark todo as pending', async () => {
    mockedTodoService.updateTodo.mockResolvedValueOnce(
      createMock<Todo>({ done: false }),
    );
    const todo = await controller.markTodoAsPending(
      createMock<Todo>({ id: 1, done: true }),
    );

    expect(todo).toHaveProperty('done', false);
  });
});
