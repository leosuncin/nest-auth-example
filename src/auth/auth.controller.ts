import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { SignUp } from './dto/sign-up.dto';
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() signUp: SignUp, @Res() resp: Response) {
    const user = await this.authService.register(signUp);
    const token = this.authService.signToken(user);

    delete user.password;
    resp.setHeader('Authorization', `Bearer ${token}`);
    resp.send(user);

    return resp;
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res() resp: Response) {
    const user = req.user as User;
    const token = this.authService.signToken(user);

    delete user.password;
    resp.setHeader('Authorization', `Bearer ${token}`);
    resp.send(user);

    return resp;
  }
}
