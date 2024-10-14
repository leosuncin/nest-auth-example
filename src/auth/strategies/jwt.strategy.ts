import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';

import { User } from '../../user/entities/user.entity';
import { AuthService } from '../auth.service';
import jwtConfig from '../config/jwt.config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const extractJwtFromCookie: JwtFromRequestFunction = request => {
  return request.signedCookies['token']!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    @Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>,
  ) {
    super({
      ...config.verifyOptions,
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.secret,
      passReqToCallback: false,
    });
  }

  validate(payload: JwtPayload): Promise<User> {
    return this.authService.verifyPayload(payload);
  }
}
