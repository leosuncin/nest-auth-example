import { getRepositoryToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import { EntityNotFoundError, type Repository } from 'typeorm';
import type { User } from '../../user/entities/user.entity';
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
    mockedTodoRepository = unitRef.get(getRepositoryToken(Todo) as string);
  });

  it('should be an instanceof TodoService', () => {
    expect(service).toBeInstanceOf(TodoService);
  });

  it('should create a new todo', async () => {
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

  it('should list all todo', async () => {
    const owner = { id: 1 } as User;
    mockedTodoRepository.findAndCount.mockResolvedValueOnce([[], 0]);
    const [todos, count] = await service.listTodo(new PaginationQuery(), owner);

    expect(Array.isArray(todos)).toBe(true);
    expect(count).toEqual(expect.any(Number));
  });

  it('should get one todo', async () => {
    const id = 1;

    mockedTodoRepository.findOneOrFail.mockResolvedValueOnce({
      owner: 1,
    } as Todo);
    const todo = await service.getTodo(id);

    expect(todo).toBeDefined();
  });

  it('should throw on get one when the todo not exist', async () => {
    const id = 0;

    mockedTodoRepository.findOneOrFail.mockRejectedValueOnce(
      new EntityNotFoundError(Todo, {
        where: { id },
        loadRelationIds: true,
      })
    );

    await expect(service.getTodo(id)).rejects.toThrow(EntityNotFoundError);
  });

  it('should update one todo', async () => {
    const todo = {} as Todo;
    const updates: TodoUpdate = {
      done: true,
    };

    mockedTodoRepository.save.mockResolvedValueOnce(updates as Todo);
    await expect(service.updateTodo(todo, updates)).resolves.toHaveProperty(
      'done',
      updates.done
    );
  });

  it('should remove a todo', async () => {
    const todo = {} as Todo;

    mockedTodoRepository.remove.mockResolvedValueOnce(todo);
    await expect(service.removeTodo(todo)).resolves.toBeDefined();
  });
});
