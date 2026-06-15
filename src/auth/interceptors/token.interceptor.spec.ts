/// <reference types="jest" />
import type { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { type Mocked, mock } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';
import type { User } from '../../user/entities/user.entity';
import { AuthService } from '../auth.service';
import { TokenInterceptor } from './token.interceptor';

describe('TokenInterceptor', () => {
  let interceptor: TokenInterceptor;
  let mockedAuthService: Mocked<AuthService>;

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(TokenInterceptor).compile();
    interceptor = unit;
    mockedAuthService = unitRef.get(AuthService);
  });

  it('should add the token to the response', async () => {
    const { req, res } = createMocks();
    const user = {} as User;
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
