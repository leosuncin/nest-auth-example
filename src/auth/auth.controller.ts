import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthUser } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { SignUp } from './dto/sign-up.dto';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SessionAuthGuard } from './guards/session-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() signUp: SignUp, @Res() resp: Response): Promise<Response> {
    const user = await this.authService.register(signUp);
    const token = this.authService.signToken(user);

    resp.setHeader('Authorization', `Bearer ${token}`);
    resp.cookie('token', token, {
      httpOnly: true,
      signed: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    resp.send(user);

    return resp;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@AuthUser() user: User, @Res() resp: Response): Promise<Response> {
    const token = this.authService.signToken(user);

    resp.setHeader('Authorization', `Bearer ${token}`);
    resp.cookie('token', token, {
      httpOnly: true,
      signed: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    resp.send(user);

    return resp;
  }

  @Get('/me')
  @UseGuards(SessionAuthGuard, JWTAuthGuard)
  me(@AuthUser() user: User): User {
    return user;
  }
}
