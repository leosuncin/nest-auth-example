import { IsDefined, IsPositive } from 'class-validator';

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
