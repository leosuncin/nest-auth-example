import { build, fake, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { mock, anyObject, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';

import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { Todo } from './todo.entity';
import { User } from '../user/user.entity';

const userBuilder = build<
  Omit<User, 'password' | 'hashPassword' | 'checkPassword'>
>({
  fields: {
    id: sequence(),
    name: fake(f => f.name.findName()),
    email: fake(f => f.internet.exampleEmail()),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
  postBuild: u => new User(u),
});
const todoBuilder = build<Todo>({
  fields: {
    id: sequence(),
    text: fake(f => f.lorem.sentence()),
    done: fake(f => f.random.boolean()),
    owner: userBuilder(),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
  postBuild: t => Object.assign(new Todo(), t),
});

describe('Todo Controller', () => {
  let controller: TodoController;
  let repositoryMock: MockProxy<Repository<Todo>>;

  beforeEach(async () => {
    repositoryMock = mock<Repository<Todo>>();
    repositoryMock.create.mockImplementation(dto =>
      Object.assign(new Todo(), dto),
    );
    repositoryMock.save.mockImplementation((entity: any) =>
      Promise.resolve(todoBuilder({ overrides: entity })),
    );
    repositoryMock.find.mockResolvedValue([]);
    repositoryMock.findOne
      .calledWith(1 as any, anyObject())
      .mockResolvedValue(todoBuilder({ overrides: { id: 1, owner: 1 } }));
    repositoryMock.findOne
      .calledWith(0 as any, anyObject())
      .mockResolvedValue(null);
    repositoryMock.remove.mockResolvedValue(
      todoBuilder({ overrides: { id: 1, owner: 1 } }),
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new todo', async () => {
    const newTodo = {
      text: 'Make a sandwich',
    };
    const user = userBuilder();

    await expect(
      controller.createTodo(newTodo as any, user as any),
    ).resolves.toBeInstanceOf(Todo);
  });

  test('should list all todos', async () => {
    await expect(
      controller.listTodo(userBuilder() as any),
    ).resolves.toBeDefined();
  });

  test('should get one todo', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    await expect(controller.getTodo(1, user as any)).resolves.toBeDefined();
  });

  test('should fail to get unexisting todo', async () => {
    const user = userBuilder();
    await expect(controller.getTodo(0, user as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  test("should fail to get another's todo", async () => {
    const user = userBuilder();
    await expect(controller.getTodo(1, user as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  test('should update one todo', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    const updates = { done: true };
    await expect(
      controller.updateTodo(1, updates, user as any),
    ).resolves.toBeDefined();
  });

  test('should fail to update unexisting todo', async () => {
    const user = userBuilder();
    const updates = { done: true };
    await expect(
      controller.updateTodo(0, updates, user as any),
    ).rejects.toThrow(NotFoundException);
  });

  test("should fail to update another's todo", async () => {
    const user = userBuilder();
    const updates = { done: true };
    await expect(
      controller.updateTodo(1, updates, user as any),
    ).rejects.toThrow(ForbiddenException);
  });

  test('should remove one todo', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    await expect(controller.removeTodo(1, user as any)).resolves.toBeDefined();
  });

  test('should fail to remove unexisting todo', async () => {
    const user = userBuilder();
    await expect(controller.removeTodo(0, user as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  test("should fail to remove another's todo", async () => {
    const user = userBuilder();
    await expect(controller.removeTodo(1, user as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  test('should mark todo as done', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    await expect(
      controller.markTodoAsDone(1, user as any),
    ).resolves.toHaveProperty('done', true);
  });

  test('should mark todo as pending', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    await expect(
      controller.markTodoAsPending(1, user as any),
    ).resolves.toHaveProperty('done', false);
  });
});
