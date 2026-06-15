import { Exclude } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString, MinLength } from 'class-validator';

import type { User } from '../../user/entities/user.entity';

export class TodoCreate {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly text: string;

  @Exclude()
  owner: User;
}
