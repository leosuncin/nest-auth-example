import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

export const PassportGuard = (strategy: string | string[]) =>
  class extends AuthGuard(strategy) {
    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const result = (await super.canActivate(context)) as boolean;

      await super.logIn(request);

      return result;
    }
  };
