import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { UserUpdate } from './dto/user-update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number) {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`There isn't any user with id: ${id}`);
    }

    return user;
  }

  async update(id, updates: UserUpdate) {
    const user = await this.userRepository.findOne(id);
    Object.assign(user, updates);

    if (!user) {
      throw new NotFoundException(`There isn't any user with id: ${id}`);
    }

    return this.userRepository.save(user);
  }
}
