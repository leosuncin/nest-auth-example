import * as bcrypt from 'bcryptjs';
import { IProcessor } from 'typeorm-fixtures-cli';

import { User } from '../../src/user/user.entity';

export default class UserProcessor implements IProcessor<User> {
  postProcess(name: string, object: User): void {
    const salt = bcrypt.genSaltSync();
    object.password = bcrypt.hashSync(object.password, salt);
  }
}
