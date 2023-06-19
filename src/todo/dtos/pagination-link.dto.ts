import {
  IsDefined, IsOptional,
  IsString
} from 'class-validator';


export class PaginationLink {
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
