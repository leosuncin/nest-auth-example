import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import { PaginationQuery } from '../dtos/pagination-query.dto';
import { Pagination } from '../dtos/pagination.dto';
import { PaginationInterceptor } from './pagination.interceptor';

const { limit: defaultLimit, page: defaultPage } = new PaginationQuery();

function range(min: number, max: number, step = 1) {
  const array = [];

  for (let id = min; id <= max; id += step) {
    array.push({ id });
  }

  return array;
}

describe('PaginationInterceptor', () => {
  it('should be defined', () => {
    expect(new PaginationInterceptor()).toBeDefined();
  });

  it.each([
    [range(1, 3), 100, undefined, undefined, 10],
    [range(4, 9), 100, defaultLimit.toString(), defaultPage.toString(), 10],
    [[], 0, undefined, undefined, 0],
    [range(11, 15), 100, defaultLimit.toString(), '2', 10],
    [range(20, 23), 40, '20', undefined, 2],
  ])(
    'should transform %O %i and add extra information limit=%s page=%s',
    async (items, totalItems, limit, page, pages) => {
      type Item = (typeof items)[number];
      const { req, res } = createMocks({
        path: '/api',
        headers: {
          Host: 'localhost',
        },
        query: {
          ...(limit ? { limit } : {}),
          ...(page ? { page } : {}),
        },
      });
      const context = new ExecutionContextHost([req, res]);
      const interceptor = new PaginationInterceptor<Item>();
      const result = await lastValueFrom(
        interceptor.intercept(context, {
          handle: () => of([items, totalItems]),
        }),
      );

      expect(result).toMatchObject<Pagination<Item>>({
        items: expect.any(Array),
        meta: {
          itemCount: expect.any(Number),
          totalItems: expect.any(Number),
          itemsPerPage: expect.any(Number),
          totalPages: expect.any(Number),
          currentPage: expect.any(Number),
        },
        links: {
          first: expect.stringContaining('http://localhost/api'),
          previous:
            page && +page > 1
              ? expect.stringContaining('http://localhost/api')
              : undefined,
          next:
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            parseInt(page!) || defaultPage < pages
              ? expect.stringContaining('http://localhost/api')
              : undefined,
          last:
            pages > 1
              ? expect.stringContaining('http://localhost/api')
              : undefined,
        },
      });
      expect(result.items).toEqual(items);
      expect(result.meta.itemCount).toBe(items.length);
      expect(result.meta.totalItems).toBe(totalItems);
      expect(result.meta.itemsPerPage).toBe(
        limit ? parseInt(limit) : defaultLimit,
      );
      expect(result.meta.totalPages).toBe(pages);
      expect(result.meta.currentPage).toBe(page ? parseInt(page) : defaultPage);

      const shouldIncludeTheLimit = Boolean(limit && +limit !== defaultLimit);

      if (result.links.first) {
        const first = new URL(result.links.first);

        expect(first.searchParams.has('limit')).toBe(shouldIncludeTheLimit);
        expect(first.searchParams.get('limit')).toBe(
          shouldIncludeTheLimit ? limit : null,
        );
      }

      if (result.links.next) {
        const next = new URL(result.links.next);

        expect(next.searchParams.has('limit')).toBe(shouldIncludeTheLimit);
        expect(next.searchParams.get('limit')).toBe(
          shouldIncludeTheLimit ? limit : null,
        );
        expect(next.searchParams.has('page')).toBe(true);
        expect(next.searchParams.get('page')).toBe(
          String((page ? parseInt(page) : defaultPage) + 1),
        );
      }

      if (result.links.previous) {
        const previous = new URL(result.links.previous);

        expect(previous.searchParams.has('limit')).toBe(shouldIncludeTheLimit);
        expect(previous.searchParams.get('limit')).toBe(
          shouldIncludeTheLimit ? limit : null,
        );
        expect(previous.searchParams.has('page')).toBe(true);
        expect(previous.searchParams.get('page')).toBe(
          String((page ? parseInt(page) : defaultPage) - 1),
        );
      }

      if (result.links.last) {
        const last = new URL(result.links.last);

        expect(last.searchParams.has('limit')).toBe(shouldIncludeTheLimit);
        expect(last.searchParams.get('limit')).toBe(
          shouldIncludeTheLimit ? limit : null,
        );
        expect(last.searchParams.has('page')).toBe(true);
        expect(last.searchParams.get('page')).toBe(String(pages));
      }
    },
  );
});
