import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { User } from '../entities/user.entity';

export const AuthUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<Request>().user as User;

    return data ? user?.[data] : user;
  }
);
