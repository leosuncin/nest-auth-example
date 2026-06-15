import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  type JwtFromRequestFunction,
  Strategy,
} from 'passport-jwt';
import type { User } from '../../user/entities/user.entity';
import { AuthService } from '../auth.service';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

const extractJwtFromCookie: JwtFromRequestFunction = (request) =>
  request.signedCookies.token;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  @Inject(AuthService)
  private readonly authService: AuthService;

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.APP_SECRET,
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  validate(payload: JwtPayload): Promise<User> {
    return this.authService.verifyPayload(payload);
  }
}
