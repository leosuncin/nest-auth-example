import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
  Req,
  Res,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { SignUp } from './dto/sign-up.dto';
import { User } from 'src/user/user.entity';
import { PassportGuard } from './guards/passport.guard';
import { SessionGuard } from './guards/session.guard';

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
  @UseGuards(PassportGuard('local'))
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
  @UseGuards(SessionGuard)
  me(@Req() req: Request) {
    return req.user || req.session.passport.user;
  }
}
