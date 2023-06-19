import { HttpStatus } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMocks } from 'node-mocks-http';
import { EntityNotFoundError } from 'typeorm';

import { Todo } from '../entities/todo.entity';
import { TodoFilter } from './todo.filter';

describe('TodoFilter', () => {
  it('should be defined', () => {
    expect(new TodoFilter()).toBeDefined();
  });

  it('should catch EntityNotFoundError', () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/todo/0',
      params: { id: 0 },
    });
    const host = new ExecutionContextHost([req, res]);
    const exception = new EntityNotFoundError(Todo, {
      where: { id: 0 },
    });
    const filter = new TodoFilter();

    filter.catch(exception, host);

    expect(res._getStatusCode()).toBe(HttpStatus.NOT_FOUND);
    expect(res._getJSONData()).toEqual({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Not found any todo with id: ${req.params.id}`,
      error: 'Todo Not Found',
    });
  });
});
