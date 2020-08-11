import { IsDefined, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Exclude } from 'class-transformer';

import { User } from '../user/user.entity';

export class TodoCreate {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly text: string;

  @Exclude()
  owner: User;
}
