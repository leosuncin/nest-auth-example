import { Inject, Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Reflect metadata
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  type JwtFromRequestFunction,
  Strategy,
} from 'passport-jwt';

import type { User } from '../entities/user.entity';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../services/auth.service';

const extractJwtFromCookie: JwtFromRequestFunction = (request) =>
  request.signedCookies.token;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  @Inject(AuthService)
  private readonly authService!: AuthService;

  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.getOrThrow<string>('APP_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  validate(payload: JwtPayload): Promise<User> {
    return this.authService.verifyPayload(payload);
  }
}
