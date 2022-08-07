import type { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Test, type TestingModule } from '@nestjs/testing';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';
import { createMock } from 'ts-auto-mock';

import type { User } from '../../user/user.entity';
import { TokenInterceptor } from './token.interceptor';
import { AuthService } from '../auth.service';

describe('TokenInterceptor', () => {
  let interceptor: TokenInterceptor;
  let mockedAuthService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenInterceptor],
    })
      .useMocker(token => {
        if (Object.is(token, AuthService)) {
          return createMock<AuthService>();
        }
      })
      .compile();

    interceptor = module.get<TokenInterceptor>(TokenInterceptor);
    mockedAuthService = module.get<AuthService, jest.Mocked<AuthService>>(
      AuthService,
    );
  });

  it('should add the token to the response', async () => {
    const { req, res } = createMocks();
    const user = createMock<User>();
    const context = new ExecutionContextHost([req, res]);
    const next = createMock<CallHandler<User>>({
      handle: () => of(user),
    });

    mockedAuthService.signToken.mockReturnValueOnce('j.w.t');

    await expect(
      lastValueFrom(interceptor.intercept(context, next)),
    ).resolves.toEqual(user);
    expect(res.getHeader('Authorization')).toBe('Bearer j.w.t');
    expect(res.cookies).toHaveProperty('token');
  });
});
