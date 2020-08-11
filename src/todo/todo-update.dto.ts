import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class TodoUpdate {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly text?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(value =>
    typeof value === 'string'
      ? ['true', '1', 'yes'].includes(value.toLowerCase())
      : Boolean(value),
  )
  readonly done?: boolean;
}
