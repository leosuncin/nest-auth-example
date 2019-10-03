import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { ProfileController } from './profile.controller';
import { UserService } from './user.service';
import { IsUserAlreadyExist } from './is-user-already-exist.validator';
import { Profile } from './profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  controllers: [ProfileController],
  providers: [UserService, IsUserAlreadyExist],
  exports: [UserService],
})
export class UserModule {}
