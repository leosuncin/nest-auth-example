import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';
import { EMAIL_QUEUE_NAME } from './constants';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    BullModule.registerQueue({
      name: EMAIL_QUEUE_NAME,
      redis: process.env.REDIS_URL,
    }),
    UserModule,
    AuthModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
