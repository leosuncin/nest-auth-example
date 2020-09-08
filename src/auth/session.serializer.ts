import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { User } from '../user/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: User, done: (err: Error | null, id?: User) => void): void {
    done(null, user);
  }

  deserializeUser(payload: unknown, done: (err: Error | null, payload?: unknown) => void): void {
    done(null, payload);
  }
}
