import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { User } from './entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: User,
    done: (err: Error | null, id?: Record<string, unknown>) => void
  ): void {
    done(null, instanceToPlain(user));
  }

  deserializeUser(
    payload: Record<string, unknown>,
    done: (err: Error | null, payload?: User) => void
  ): void {
    done(null, plainToInstance(User, payload));
  }
}
