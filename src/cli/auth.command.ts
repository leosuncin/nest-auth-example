import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';
import { Command, Positional } from 'nestjs-command';

@Injectable()
export class AuthCommand {
  constructor(private readonly jwtService: JwtService) {}

  @Command({
    command: 'create:token <email>',
    describe: 'Create a JWT with an email',
  })
  createToken(
    @Positional({ name: 'email', describe: 'An email address', type: 'string' })
    email: string,
  ): void {
    if (!isEmail(email)) {
      console.error(`${email} is not valid`);
      return process.exit(1);
    }

    const payload = {
      sub: email,
    };
    const token = this.jwtService.sign(payload);

    console.log(token);
  }
}
