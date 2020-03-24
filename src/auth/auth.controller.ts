import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
import { SignUp } from './dto/sign-up.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SessionAuthGuard } from './guards/session-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() signUp: SignUp, @Res() resp: Response) {
    const user = await this.authService.register(signUp);
    const token = this.authService.signToken(user);

    delete user.password;
    resp.setHeader('Authorization', `Bearer ${token}`);
    resp.send(user);

    return resp;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res() resp: Response) {
    const user = req.user as User;
    const token = this.authService.signToken(user);

    delete user.password;
    resp.setHeader('Authorization', `Bearer ${token}`);
    resp.send(user);

    return resp;
  }

  @Get('/me')
  @UseGuards(SessionAuthGuard)
  me(@Req() req: Request) {
    return req.session.passport.user;
  }
}
