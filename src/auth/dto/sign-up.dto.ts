import { IsDefined, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class SignUp {
  @IsDefined()
  @IsNotEmpty()
  readonly name: string;

  @IsDefined()
  @IsEmail()
  readonly email: string;

  @IsDefined()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}
