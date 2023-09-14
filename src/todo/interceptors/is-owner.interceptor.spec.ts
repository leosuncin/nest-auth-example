import { CallHandler, ForbiddenException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';
import { createMock } from 'ts-auto-mock';

import { User } from '../../user/entities/user.entity';
import { Pagination } from '../dtos/pagination.dto';
import { Todo } from '../entities/todo.entity';
import { IsOwnerInterceptor } from './is-owner.interceptor';

describe('IsOwnerInterceptor', () => {
  it('should be defined', () => {
    expect(new IsOwnerInterceptor()).toBeDefined();
  });

  it('should check that the authenticated user is the owner of the todo', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo/1',
      user: createMock<User>({ id: 1 }),
    });
    const context = new ExecutionContextHost([req, res]);
    const todo = createMock<Todo>({ owner: 1 });

    const next = createMock<CallHandler<Todo>>({
      handle: () => of(todo),
    });
    const interceptor = new IsOwnerInterceptor<Todo>();

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual(todo);
  });

  it('should check that the authenticated user is not the owner of the todo', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo/2',
      user: createMock<User>({ id: 1 }),
    });
    const context = new ExecutionContextHost([req, res]);
    const next = createMock<CallHandler<Todo>>({
      handle: () => of(createMock<Todo>({ owner: 2 })),
    });
    const interceptor = new IsOwnerInterceptor<Todo>();

    await expect(
      lastValueFrom(interceptor.intercept(context, next)),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should check that an array of todos pass', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo',
      user: createMock<User>({ id: 1 }),
    });
    const context = new ExecutionContextHost([req, res]);
    const pagination = createMock<Pagination<Todo>>({ items: [] });
    const next = createMock<CallHandler<Pagination<Todo>>>({
      handle: () => of(pagination),
    });
    const interceptor = new IsOwnerInterceptor<Pagination<Todo>>();

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual(pagination);
  });
});
