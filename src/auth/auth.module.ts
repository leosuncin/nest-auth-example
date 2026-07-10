import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './controllers/auth.controller';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { SessionSerializer } from './session.serializer';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import {
  HASH_PASSWORD,
  hashPassword,
  VERIFY_PASSWORD,
  verifyPassword,
} from './utils/password';
import { IsRegisteredConstraint } from './validators/is-registered.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: HASH_PASSWORD,
      useValue: hashPassword,
    },
    {
      provide: VERIFY_PASSWORD,
      useValue: verifyPassword,
    },
    AuthService,
    LocalStrategy,
    JwtStrategy,
    SessionSerializer,
    IsRegisteredConstraint,
  ],
})
export class AuthModule {}
