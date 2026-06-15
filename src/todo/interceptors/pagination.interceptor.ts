import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { Request } from 'express';
import { map, type Observable } from 'rxjs';
import { Pagination } from '../dtos/pagination.dto';
import { PaginationLink } from '../dtos/pagination-link.dto';
import { PaginationMeta } from '../dtos/pagination-meta.dto';
import { PaginationQuery } from '../dtos/pagination-query.dto';

type PartialWritable<T> = {
  -readonly [P in keyof T]?: T[P];
} & {};

@Injectable()
export class PaginationInterceptor<Item>
  implements NestInterceptor<[Item[], number], Pagination<Item>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<[Item[], number]>
  ): Observable<Pagination<Item>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { limit: itemsPerPage, page: currentPage } = plainToInstance(
      PaginationQuery,
      request.query
    );

    return next.handle().pipe(
      map(([items, totalItems]) => {
        const itemCount = items.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const meta = plainToInstance(PaginationMeta, {
          itemCount,
          totalItems,
          itemsPerPage,
          totalPages,
          currentPage,
        });

        return plainToInstance(Pagination<Item>, {
          items,
          meta,
          links: this.#createLinks(request, meta),
        });
      })
    );
  }

  #createLinks(request: Request, meta: PaginationMeta): PaginationLink {
    const { limit: defaultLimit } = new PaginationQuery();
    const url = new URL('http://localhost');
    url.protocol = request.protocol;
    url.host = request.get('host');
    url.pathname = request.path;
    const plain: PartialWritable<PaginationLink> = {
      first: url.toString(),
      previous: undefined,
      next: undefined,
      last: undefined,
    };

    if (meta.itemsPerPage !== defaultLimit) {
      url.searchParams.set('limit', String(meta.itemsPerPage));
      plain.first = url.toString();
    }

    if (meta.currentPage > 1) {
      url.searchParams.set('page', String(meta.currentPage - 1));
      plain.previous = url.toString();
    }

    if (meta.currentPage < meta.totalPages) {
      url.searchParams.set('page', String(meta.currentPage + 1));
      plain.next = url.toString();
    }

    if (meta.totalPages > 1) {
      url.searchParams.set('page', String(meta.totalPages));
      plain.last = url.toString();
    }

    return plainToInstance(PaginationLink, plain);
  }
}
