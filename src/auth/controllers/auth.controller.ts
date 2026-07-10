import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthUser } from '../decorators/user.decorator';
// biome-ignore lint/style/useImportType: Reflect metadata
import { SignUp } from '../dto/sign-up.dto';
// biome-ignore lint/style/useImportType: Reflect metadata
import { UserUpdate } from '../dto/user-update.dto';
import type { User } from '../entities/user.entity';
import { JWTAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SessionAuthGuard } from '../guards/session-auth.guard';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { TokenInterceptor } from '../interceptors/token.interceptor';
import { AuthService } from '../services/auth.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  @Inject(AuthService)
  private readonly authService!: AuthService;

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(TokenInterceptor)
  register(@Body() signUp: SignUp): Promise<User> {
    return this.authService.register(signUp);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(TokenInterceptor)
  login(@AuthUser() user: User): User {
    return user;
  }

  @Get('/me')
  @UseGuards(SessionAuthGuard, JWTAuthGuard)
  me(@AuthUser() user: User): User {
    return user;
  }

  @Put('/me')
  @UseGuards(SessionAuthGuard, JWTAuthGuard)
  @UseInterceptors(CurrentUserInterceptor, TokenInterceptor)
  updateMe(@AuthUser() user: User, @Body() changes: UserUpdate): Promise<User> {
    return this.authService.updateUser(user, changes);
  }
}
