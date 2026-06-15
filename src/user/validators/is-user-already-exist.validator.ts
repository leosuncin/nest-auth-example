import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import type { Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@ValidatorConstraint({ name: 'isUserAlreadyExist', async: true })
@Injectable()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  @InjectRepository(User)
  private readonly userRepository!: Repository<User>;

  async validate(email: string): Promise<boolean> {
    if (!email) {
      return true;
    }

    const user = await this.userRepository.findOneBy({ email });

    return !user;
  }

  defaultMessage(): string {
    return 'The email «$value» is already register.';
  }
}
