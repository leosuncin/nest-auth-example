import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/user.entity';
import { SignUp } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(userData: SignUp): Promise<User> {
    const user = Object.assign(new User(), userData);

    if ((await this.userRepository.count({ email: userData.email })) > 0) {
      throw new UnprocessableEntityException(
        `The email «${userData.email}» is already register.`,
      );
    }

    return this.userRepository.save(user);
  }
}
