import { type CallHandler, ForbiddenException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { mock } from '@suites/doubles.jest';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import type { User } from '../../user/entities/user.entity';
import type { Pagination } from '../dtos/pagination.dto';
import type { Todo } from '../entities/todo.entity';
import { IsOwnerInterceptor } from './is-owner.interceptor';

describe('IsOwnerInterceptor', () => {
  it('should be defined', () => {
    expect(new IsOwnerInterceptor()).toBeDefined();
  });

  it('should check that the authenticated user is the owner of the todo', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo/1',
      user: mock<User>({ id: 1 }),
    });
    const context = new ExecutionContextHost([req, res]);
    const todo = { owner: 1 } as Todo;

    const next = mock<CallHandler<Todo>>({
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
      user: mock<User>({ id: 1 }),
    });
    const context = new ExecutionContextHost([req, res]);
    const next = mock<CallHandler<Todo>>({
      handle: () => of({ owner: 2 } as Todo),
    });
    const interceptor = new IsOwnerInterceptor<Todo>();

    await expect(
      lastValueFrom(interceptor.intercept(context, next))
    ).rejects.toThrow(ForbiddenException);
  });

  it('should check that an array of todos pass', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo',
      user: mock<User>({ id: 1 }),
    });
    const context = new ExecutionContextHost([req, res]);
    const pagination: Pagination<Todo> = {
      items: [],
      links: {
        first: '',
        previous: '',
        next: '',
        last: '',
      },
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1,
      },
    };
    const next = mock<CallHandler<Pagination<Todo>>>({
      handle: () => of(pagination),
    });
    const interceptor = new IsOwnerInterceptor<Pagination<Todo>>();

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual(pagination);
  });
});
