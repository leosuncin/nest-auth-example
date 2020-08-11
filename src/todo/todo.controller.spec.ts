import { build, fake, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { Todo } from './todo.entity';
import { User } from '../user/user.entity';

const userBuilder = build<
  Omit<User, 'password' | 'setPassword' | 'checkPassword'>
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
    done: perBuild(() => false),
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
          useValue: {
            create: dto => dto,
            save: dto => Promise.resolve(todoBuilder({ overrides: dto })),
            find: () => Promise.resolve([]),
            findOne: id =>
              Promise.resolve(
                id > 0 ? todoBuilder({ overrides: { id, owner: id } }) : null,
              ),
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
});
