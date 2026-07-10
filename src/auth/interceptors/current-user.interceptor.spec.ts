import type { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';
import { User } from '../entities/user.entity';
import { CurrentUserInterceptor } from './current-user.interceptor';

describe('CurrentUserInterceptor', () => {
  const user = new User({
    id: '47771cf6-acd5-457e-bbf1-3eed573a8031',
    email: 'john.doe@example.com',
  });

  it("given the interceptor is executed when the request body and an authenticated user are provided then it injects the user's id", async () => {
    const { req, res } = createMocks({
      body: {
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        email: 'johndoe@example.com',
        image: 'https://thispersondoesnotexist.com/image',
        password: 'ji32k7au4a83',
        username: 'john.doe',
      },
      user,
    });
    const context = new ExecutionContextHost([req, res]);
    const next: CallHandler = {
      handle: () => of({}),
    };
    const interceptor = new CurrentUserInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(req).toHaveProperty('body.id', user.id);
  });

  it("given the interceptor is executed when no request body is provided then it does not inject the user's id", async () => {
    const { req, res } = createMocks({
      user,
    });
    req.body = null;
    const context = new ExecutionContextHost([req, res]);
    const next: CallHandler = {
      handle: () => of({}),
    };
    const interceptor = new CurrentUserInterceptor();

    req.body = undefined;
    await lastValueFrom(interceptor.intercept(context, next));

    expect(req).not.toHaveProperty('body.id');
  });

  it('given the interceptor is executed when no authenticated user is provided then it does not modify the request body', async () => {
    const { req, res } = createMocks({
      body: {
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        email: 'johndoe@example.com',
        image: 'https://thispersondoesnotexist.com/image',
        password: 'ji32k7au4a83',
        username: 'john.doe',
      },
      user: undefined,
    });
    const context = new ExecutionContextHost([req, res]);
    const next: CallHandler = {
      handle: () => of({}),
    };
    const interceptor = new CurrentUserInterceptor();

    await lastValueFrom(interceptor.intercept(context, next));

    expect(req).not.toHaveProperty('body.id');
  });
});
