import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SessionAuthGuard extends AuthGuard('session') {}
