import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenTelemetryModule, WideEventInterceptor } from 'nestjs-otel';
import { LoggerModule } from "pino-nestjs";

import { AuthModule } from './auth/auth.module';
import dataSourceConfig from './config/data-source';
import { HealthModule } from './health-check/health.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(dataSourceConfig.asProvider()),
    TerminusModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
      },
      wideEvents: {
        seed(context) {
          const request = context
            .switchToHttp()
            .getRequest<import('express').Request>();

          return {
            'nestjs.user.is_authenticated': Boolean(request.user),
            'nestjs.user.id': request.user?.id,
          };
        },
      },
    }),
    LoggerModule.forRoot(),
    HealthModule,
    AuthModule,
    TodoModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: WideEventInterceptor,
    },
  ],
})
export class AppModule {}
