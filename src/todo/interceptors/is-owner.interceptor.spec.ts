import { type CallHandler, ForbiddenException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { mock } from '@suites/doubles.vitest';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import { User } from '../../auth/entities/user.entity';
import type { Pagination } from '../dtos/pagination.dto';
import { Todo } from '../entities/todo.entity';
import { IsOwnerInterceptor } from './is-owner.interceptor';

describe('IsOwnerInterceptor', () => {
  it('given intercept is executed when a todo owned by the authenticated user is provided then it returns the todo', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo/1',
      user: new User({ id: 'a4a1240a-dbfd-403a-91d8-509603491065' }),
    });
    const context = new ExecutionContextHost([req, res]);
    const todo = { owner: 'a4a1240a-dbfd-403a-91d8-509603491065' } as Todo;

    const next = mock<CallHandler<Todo>>({
      handle: () => of(todo),
    });
    const interceptor = new IsOwnerInterceptor<Todo>();

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual(todo);
  });

  it('given intercept is executed when a todo not owned by the authenticated user is provided then it throws forbidden', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo/2',
      user: new User({ id: '2efd46c8-72c7-4755-bc44-f75ec17f0dd4' }),
    });
    const context = new ExecutionContextHost([req, res]);
    const next = mock<CallHandler<Todo>>({
      handle: () =>
        of(new Todo({ owner: 'b6d45ae6-7514-4132-b2f6-5d7c439e8c12' })),
    });
    const interceptor = new IsOwnerInterceptor<Todo>();

    await expect(
      lastValueFrom(interceptor.intercept(context, next))
    ).rejects.toThrow(ForbiddenException);
  });

  it('given intercept is executed when a paginated todo response is provided then it returns the pagination result', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo',
      user: new User({ id: 'b65695fe-d11e-412a-9610-916a53ccf97a' }),
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
