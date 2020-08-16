import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';
import { MailModule } from './mail/mail.module';
import bull from './config/bull.config';
import mailer from './config/mailer.config';
import mail from './config/mail.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bull, mailer, mail],
    }),
    TypeOrmModule.forRoot(),
    BullModule.registerQueueAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return config.get('bull');
      },
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return config.get('mailer');
      },
    }),
    UserModule,
    AuthModule,
    TodoModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
