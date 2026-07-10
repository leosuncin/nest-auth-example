import type { CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { type Mocked, mock } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';
import { TokenInterceptor } from './token.interceptor';

describe('TokenInterceptor', () => {
  let interceptor: TokenInterceptor;
  let mockedAuthService: Mocked<AuthService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(TokenInterceptor)
      .mock(ConfigService)
      .final({
        get() {
          return 'token';
        },
      })
      .compile();
    interceptor = unit;
    mockedAuthService = unitRef.get(
      AuthService
    ) as unknown as Mocked<AuthService>;
  });

  it('given the interceptor is executed when a user is returned then it adds the token', async () => {
    const { req, res } = createMocks();
    const user = new User({ email: 'user@example.net' });
    const context = new ExecutionContextHost([req, res]);
    const next = mock<CallHandler<User>>({
      handle: () => of(user),
    });

    mockedAuthService.signToken.mockReturnValueOnce('j.w.t');

    await expect(
      lastValueFrom(interceptor.intercept(context, next))
    ).resolves.toEqual(user);
    expect(res.getHeader('Authorization')).toBe('Bearer j.w.t');
    expect(res.cookies).toHaveProperty('token');
  });
});
