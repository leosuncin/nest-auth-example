import {
  Allow,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsNotEqualTo } from '../validators/is-not-equal-to.validator';
import { IsRegistered } from '../validators/is-registered.validator';

export class UserUpdate {
  @Allow()
  readonly id!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @IsRegistered()
  readonly email!: string;

  @IsOptional()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  @IsNotEqualTo('email')
  readonly password!: string;
}
