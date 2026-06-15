import { type Mocked, mock } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';

import type { User } from '../../user/entities/user.entity';
import { PaginationQuery } from '../dtos/pagination-query.dto';
import type { TodoCreate } from '../dtos/todo-create.dto';
import type { TodoUpdate } from '../dtos/todo-update.dto';
import type { Todo } from '../entities/todo.entity';
import { TodoService } from '../services/todo.service';
import { TodoController } from './todo.controller';

describe('Todo Controller', () => {
  let controller: TodoController;
  let mockedTodoService: Mocked<TodoService>;
  const user = mock<User>({ id: 1 });

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(TodoController).compile();

    controller = unit;
    mockedTodoService = unitRef.get(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new todo', async () => {
    const newTodo: TodoCreate = {
      text: 'Make a sandwich',
      owner: user,
    };

    mockedTodoService.createTodo.mockResolvedValue(mock<Todo>(newTodo));

    await expect(controller.createTodo(newTodo, user)).resolves.toBeDefined();
  });

  it('should list all todos', async () => {
    mockedTodoService.listTodo.mockResolvedValueOnce([[], 0]);
    const [todos, count] = await controller.listTodo(
      new PaginationQuery(),
      user
    );

    expect(Array.isArray(todos)).toBe(true);
    expect(count).toEqual(expect.any(Number));
  });

  it('should get one todo', async () => {
    const id = 1;

    mockedTodoService.getTodo.mockResolvedValueOnce(mock<Todo>({ id }));
    const todo = await controller.getTodo(id);

    expect(todo).toHaveProperty('id', id);
  });

  it('should update one todo', async () => {
    const updates: TodoUpdate = {
      done: true,
      text: 'Duis do labore enim in irure.',
    };

    mockedTodoService.updateTodo.mockResolvedValueOnce(mock<Todo>(updates));
    const todo = await controller.updateTodo(mock<Todo>({ id: 1 }), updates);

    expect(todo).toHaveProperty('done', updates.done);
    expect(todo).toHaveProperty('text', updates.text);
  });

  it('should remove one todo', async () => {
    const todo = mock<Todo>({ id: 1 });

    mockedTodoService.removeTodo.mockResolvedValueOnce(todo);

    await expect(controller.removeTodo(todo)).resolves.toBeDefined();
  });

  it('should mark todo as done', async () => {
    mockedTodoService.updateTodo.mockResolvedValueOnce(
      mock<Todo>({ done: true })
    );
    const todo = await controller.markTodoAsDone(
      mock<Todo>({ id: 1, done: false })
    );

    expect(todo).toHaveProperty('done', true);
  });

  it('should mark todo as pending', async () => {
    mockedTodoService.updateTodo.mockResolvedValueOnce(
      mock<Todo>({ done: false })
    );
    const todo = await controller.markTodoAsPending(
      mock<Todo>({ id: 1, done: true })
    );

    expect(todo).toHaveProperty('done', false);
  });
});
