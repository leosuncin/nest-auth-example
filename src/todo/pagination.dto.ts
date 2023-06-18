import {
  IsArray,
  IsDefined,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class PaginationMeta {
  /**
   * The amount of items on this specific page
   */
  @IsDefined()
  @IsPositive()
  readonly itemCount: number;
  /**
   * The total amount of items
   */
  @IsDefined()
  @IsPositive()
  readonly totalItems: number;
  /**
   * The amount of items that were requested per page
   */
  @IsDefined()
  @IsPositive()
  readonly itemsPerPage: number;
  /**
   * the total amount of pages in this paginator
   */
  @IsDefined()
  @IsPositive()
  readonly totalPages: number;
  /**
   * the current page this paginator "points" to
   */
  @IsDefined()
  @IsPositive()
  readonly currentPage: number;
}

export class PaginationLinks {
  /**
   * a link to the "first" page
   */
  @IsDefined()
  @IsString()
  readonly first: string;
  /**
   * a link to the "previous" page
   */
  @IsOptional()
  @IsString()
  readonly previous?: string | undefined;
  /**
   * a link to the "next" page
   */
  @IsOptional()
  @IsString()
  readonly next?: string | undefined;
  /**
   * a link to the "last" page
   */
  @IsOptional()
  @IsString()
  readonly last?: string | undefined;
}

export class Pagination<Item> {
  /**
   * The list of items to be returned
   */
  @IsDefined()
  @IsArray()
  readonly items: Array<Item>;
  /**
   * The associated meta information
   */
  @IsDefined()
  @IsObject()
  readonly meta: PaginationMeta;
  /**
   * associated links
   */
  @IsDefined()
  @IsObject()
  readonly links: PaginationLinks;

  static [Symbol.hasInstance](instance: unknown): boolean {
    return (
      instance !== null &&
      typeof instance === 'object' &&
      'items' in instance &&
      Array.isArray(instance.items) &&
      'meta' in instance &&
      'links' in instance
    );
  }
}
