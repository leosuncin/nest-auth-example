import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { User } from '../user/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: User,
    done: (err: Error | null, id?: User) => void,
  ): void {
    delete user.password;
    done(null, user);
  }

  deserializeUser(
    payload: unknown,
    done: (err: Error | null, payload?: unknown) => void,
  ): void {
    done(null, payload);
  }
}
