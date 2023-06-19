import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { Pagination } from '../dtos/pagination.dto';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class IsOwnerInterceptor<T extends Todo | Pagination<Todo>>
  implements NestInterceptor<T, T>
{
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(todo => {
        if (!user || todo instanceof Pagination) return;

        const userId =
          typeof todo.owner === 'object' ? todo.owner.id : todo.owner;
        const isOwner = userId === user.id;

        if (!isOwner) {
          throw new ForbiddenException(`Todo does not belong to you`);
        }
      }),
    );
  }
}
