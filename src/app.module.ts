import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';
import { MailModule } from './mail/mail.module';
import mailer from './config/mailer.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [mailer],
    }),
    TypeOrmModule.forRoot(),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('mailer'),
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
