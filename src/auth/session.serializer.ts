import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import type { User } from '../user/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: User,
    done: (err: Error | null, id?: User) => void
  ): void {
    user.password = undefined;
    done(null, user);
  }

  deserializeUser(
    payload: unknown,
    done: (err: Error | null, payload?: unknown) => void
  ): void {
    done(null, payload);
  }
}
