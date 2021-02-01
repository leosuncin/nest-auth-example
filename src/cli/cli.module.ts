import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommandModule } from 'nestjs-command';

import { AuthCommand } from './auth.command';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: {
        expiresIn: '1d',
        algorithm: 'HS384',
      },
      verifyOptions: {
        algorithms: ['HS384'],
      },
    }),
    CommandModule,
  ],
  providers: [AuthCommand],
})
export class CliModule {}
