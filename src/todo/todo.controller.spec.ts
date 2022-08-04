import { faker } from '@faker-js/faker';
import { build, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { mock, Matcher } from 'jest-mock-extended';
import type { Repository } from 'typeorm';

import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { Todo } from './todo.entity';
import { User } from '../user/user.entity';

const userBuilder = build<User>({
  fields: {
    id: sequence(),
    name: perBuild(() => faker.name.findName()),
    email: perBuild(() => faker.internet.exampleEmail()),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
    password: undefined,
    checkPassword: perBuild(() => jest.fn()),
    hashPassword: perBuild(() => jest.fn()),
  },
  postBuild: u => new User(u),
});
const todoBuilder = build<Todo>({
  fields: {
    id: sequence(),
    text: perBuild(() => faker.lorem.sentence()),
    done: perBuild(() => faker.datatype.boolean()),
    owner: userBuilder(),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
  postBuild: t => Object.assign(new Todo(), t),
});

describe('Todo Controller', () => {
  let controller: TodoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useFactory() {
            const todo = todoBuilder({ overrides: { id: 1, owner: 1 } });
            const repositoryMocked = mock<Repository<Todo>>({
              create: jest
                .fn()
                .mockImplementation(dto => Object.assign(new Todo(), dto)),
              save: jest
                .fn()
                .mockImplementation(entity =>
                  Promise.resolve(todoBuilder({ overrides: entity })),
                ),
              merge: jest.fn().mockImplementation(Object.assign),
            });

            repositoryMocked.findOne
              .calledWith(
                // @ts-expect-error expect a single option
                new Matcher(options => options.where.id > 0, 'todo.id'),
              )
              .mockResolvedValueOnce(todo);
            repositoryMocked.find.mockResolvedValue([todo]);
            repositoryMocked.remove.mockResolvedValue(todo);

            return repositoryMocked;
          },
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

  it('should list all todos', async () => {
    await expect(
      controller.listTodo(userBuilder() as any),
    ).resolves.toBeDefined();
  });

  it('should get one todo', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    await expect(controller.getTodo(1, user as any)).resolves.toBeDefined();
  });

  it('should fail to get nonexisting todo', async () => {
    const user = userBuilder();
    await expect(controller.getTodo(0, user as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should fail to get another's todo", async () => {
    const user = userBuilder();
    await expect(controller.getTodo(1, user as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should update one todo', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    const updates = { done: true };
    await expect(
      controller.updateTodo(1, updates, user as any),
    ).resolves.toBeDefined();
  });

  it('should fail to update nonexisting todo', async () => {
    const user = userBuilder();
    const updates = { done: true };
    await expect(
      controller.updateTodo(0, updates, user as any),
    ).rejects.toThrow(NotFoundException);
  });

  it("should fail to update another's todo", async () => {
    const user = userBuilder();
    const updates = { done: true };
    await expect(
      controller.updateTodo(1, updates, user as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should remove one todo', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    await expect(controller.removeTodo(1, user as any)).resolves.toBeDefined();
  });

  it('should fail to remove nonexisting todo', async () => {
    const user = userBuilder();
    await expect(controller.removeTodo(0, user as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should fail to remove another's todo", async () => {
    const user = userBuilder();
    await expect(controller.removeTodo(1, user as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should mark todo as done', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    await expect(
      controller.markTodoAsDone(1, user as any),
    ).resolves.toHaveProperty('done', true);
  });

  it('should mark todo as pending', async () => {
    const user = userBuilder({ overrides: { id: 1 } });
    await expect(
      controller.markTodoAsPending(1, user as any),
    ).resolves.toHaveProperty('done', false);
  });
});
