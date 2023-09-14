import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { ProfileController } from './controllers/profile.controller';
import { UserService } from './services/user.service';
import { IsUserAlreadyExist } from './validators/is-user-already-exist.validator';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  controllers: [ProfileController],
  providers: [UserService, IsUserAlreadyExist],
  exports: [UserService],
})
export class UserModule {}
