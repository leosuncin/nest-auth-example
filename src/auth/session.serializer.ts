import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { User } from '../user/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: User, done: (err: Error | null, id?: any) => void) {
    done(null, user);
  }

  deserializeUser(id: any, done: (err: Error | null, payload?: User) => void) {
    done(null, id);
  }
}
