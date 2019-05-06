import {
  Injectable,
  UnprocessableEntityException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/user.entity';
import { SignUp } from './dto/sign-up.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UnauthorizedException(
        `There isn't any user with email: ${email}`,
      );
    }

    if (!(await user.checkPassword(password))) {
      throw new UnauthorizedException(
        `Wrong password for user with email: ${email}`,
      );
    }

    return user;
  }

  async verifyPayload(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({ email: payload.sub });

    if (!user) {
      throw new UnauthorizedException(
        `There isn't any user with email: ${payload.sub}`,
      );
    }

    return user;
  }

  signToken(user: User) {
    const payload = {
      sub: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
