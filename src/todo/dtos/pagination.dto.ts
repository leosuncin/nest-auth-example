import {
  IsArray,
  IsDefined,
  IsObject,
} from 'class-validator';

import { PaginationMeta } from './pagination-meta.dto';
import { PaginationLink } from './pagination-link.dto';

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
  readonly links: PaginationLink;

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
