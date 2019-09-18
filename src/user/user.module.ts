import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { ProfileController } from './profile.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ProfileController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
