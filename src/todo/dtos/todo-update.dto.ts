import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class TodoUpdate {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly text?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? ['true', '1', 'yes'].includes(value.toLowerCase())
      : Boolean(value)
  )
  readonly done?: boolean;
}
