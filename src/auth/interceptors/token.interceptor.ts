import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  @Inject(AuthService)
  private readonly authService!: AuthService;
  @Inject(ConfigService)
  private readonly config!: ConfigService<{
    NODE_ENV: 'production' | 'development' | 'test';
    cookieName: string;
  }>;

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>
  ): Observable<User> {
    return next.handle().pipe(
      map((user) => {
        const response = context.switchToHttp().getResponse<Response>();
        const token = this.authService.signToken(user);

        response.setHeader('Authorization', `Bearer ${token}`);
        response.cookie(this.config.get('cookieName', 'token'), token, {
          httpOnly: true,
          signed: true,
          sameSite: 'strict',
          secure: this.config.get('NODE_ENV') === 'production',
        });

        return user;
      })
    );
  }
}
