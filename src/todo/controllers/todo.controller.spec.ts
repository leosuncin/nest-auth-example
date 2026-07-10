import { type Mocked, mock } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';

import { User } from '../../auth/entities/user.entity';
import { PaginationQuery } from '../dtos/pagination-query.dto';
import type { TodoCreate } from '../dtos/todo-create.dto';
import type { TodoUpdate } from '../dtos/todo-update.dto';
import { Todo } from '../entities/todo.entity';
import { TodoService } from '../services/todo.service';
import { TodoController } from './todo.controller';

describe('Todo Controller', () => {
  let controller: TodoController;
  let mockedTodoService: Mocked<TodoService>;
  const user = new User({ id: 'e816dca4-95f7-4b0d-b5da-f67f679a3676' });

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(TodoController).compile();

    controller = unit;
    mockedTodoService = unitRef.get(
      TodoService
    ) as unknown as Mocked<TodoService>;
  });

  it('given the createTodo is called when the data is valid then it returns a todo', async () => {
    const newTodo: TodoCreate = {
      text: 'Make a sandwich',
      owner: user,
    };

    mockedTodoService.createTodo.mockResolvedValue(new Todo(newTodo));

    await expect(controller.createTodo(newTodo, user)).resolves.toBeDefined();
  });

  it('given the listTodo is called when the pagination and a user are passed then it returns todos and count', async () => {
    mockedTodoService.listTodo.mockResolvedValueOnce([[], 0]);
    const [todos, count] = await controller.listTodo(
      new PaginationQuery(),
      user
    );

    expect(Array.isArray(todos)).toBe(true);
    expect(count).toEqual(expect.any(Number));
  });

  it('given the getTodo is called when a todo id is passed then it returns the todo', async () => {
    const id = 'b04638e7-2cb1-4d12-8b99-b2601eabc98b';

    mockedTodoService.getTodo.mockResolvedValueOnce(new Todo({ id }));
    const todo = await controller.getTodo(id);

    expect(todo).toHaveProperty('id', id);
  });

  it('given the updateTodo is called when a todo and changes are passed then it returns the updated todo', async () => {
    const updates: TodoUpdate = {
      done: true,
      text: 'Duis do labore enim in irure.',
    };

    mockedTodoService.updateTodo.mockResolvedValueOnce(new Todo(updates));
    const todo = await controller.updateTodo(
      new Todo({ id: 'b04638e7-2cb1-4d12-8b99-b2601eabc98b' }),
      updates
    );

    expect(todo).toHaveProperty('done', updates.done);
    expect(todo).toHaveProperty('text', updates.text);
  });

  it('given the removeTodo is called when a todo is passed then it removes and returns the todo', async () => {
    const todo = new Todo({ id: '896e639e-c894-4b76-8aee-51cca20abbee' });

    mockedTodoService.removeTodo.mockResolvedValueOnce(todo);

    await expect(controller.removeTodo(todo)).resolves.toBeDefined();
  });

  it('given the markTodoAsDone is called when a pending todo is passed then it returns a done todo', async () => {
    mockedTodoService.updateTodo.mockResolvedValueOnce(
      mock<Todo>({ done: true })
    );
    const todo = await controller.markTodoAsDone(
      new Todo({ id: 'b04638e7-2cb1-4d12-8b99-b2601eabc98b', done: false })
    );

    expect(todo).toHaveProperty('done', true);
  });

  it('given the markTodoAsPending is called when a done todo is passed then it returns a pending todo', async () => {
    mockedTodoService.updateTodo.mockResolvedValueOnce(
      new Todo({ done: false })
    );
    const todo = await controller.markTodoAsPending(
      new Todo({ id: 'b04638e7-2cb1-4d12-8b99-b2601eabc98b', done: true })
    );

    expect(todo).toHaveProperty('done', false);
  });
});
