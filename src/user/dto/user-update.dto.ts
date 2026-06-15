import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class UserUpdate {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name;
}
