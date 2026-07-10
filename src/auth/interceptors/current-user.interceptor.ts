import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';

declare module 'express' {
  export interface Request {
    user?: import('../entities/user.entity').User;
  }
}

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request<unknown, unknown, Record<string, unknown> | undefined>
      >();

    if (this.isObject(request.body) && request.user) {
      Object.assign(request.body, { id: request.user.id });
    }

    return next.handle();
  }

  private isObject(body: unknown): body is Record<string, unknown> {
    return (
      typeof body === 'object' && body != null && Object.keys(body).length >= 0
    );
  }
}
