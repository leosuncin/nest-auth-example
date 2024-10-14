import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import cookieConfig from './config/cookie.config';
import corsConfig from './config/cors.config';
import dataSourceConfig from './config/data-source.config';
import sessionConfig from './config/session.config';
import validationConfig from './config/validation.config';
import { HealthController } from './health.controller';
import { TodoModule } from './todo/todo.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [corsConfig, cookieConfig, sessionConfig, validationConfig],
    }),
    TypeOrmModule.forRootAsync(dataSourceConfig.asProvider()),
    TerminusModule,
    UserModule,
    AuthModule,
    TodoModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
