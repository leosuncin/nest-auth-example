import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsNotEqualTo } from '../validators/is-not-equal-to.validator';
import { IsRegistered as IsNotRegistered } from '../validators/is-registered.validator';

export class SignUp {
  @IsDefined()
  @IsNotEmpty()
  readonly name!: string;

  @IsDefined()
  @IsEmail()
  @IsNotRegistered()
  readonly email!: string;

  @IsDefined()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  @IsNotEqualTo('email')
  readonly password!: string;
}
