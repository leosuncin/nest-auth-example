import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, type Repository } from 'typeorm';

import type { SignUp } from '../dto/sign-up.dto';
import type { UserUpdate } from '../dto/user-update.dto';
import { User } from '../entities/user.entity';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectVerifier, type verifyPassword } from '../utils/password';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly userRepository!: Repository<User>;

  @Inject(JwtService)
  private readonly jwtService!: JwtService;

  @InjectVerifier()
  private readonly verifyPassword!: typeof verifyPassword;

  register(signUp: SignUp): Promise<User> {
    const user = this.userRepository.create(signUp);

    return this.userRepository.save(user);
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email },
      });
      const validPassword = await this.verifyPassword(password, user.password);

      if (!validPassword) {
        throw new UnauthorizedException(
          `Wrong password for user with email: ${email}`
        );
      }

      return user;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new UnauthorizedException(
          `There isn't any user with email: ${email}`,
          { cause: error }
        );
      }

      throw error;
    }
  }

  updateUser(user: User, changes: UserUpdate): Promise<User> {
    return this.userRepository.save(this.userRepository.merge(user, changes));
  }

  verifyPayload(payload: JwtPayload): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { email: payload.sub },
    });
  }

  signToken(user: User): string {
    const payload = {
      sub: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
