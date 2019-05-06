import { IsDefined, IsString, IsNotEmpty } from 'class-validator';

export class UserUpdate {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name;
}
