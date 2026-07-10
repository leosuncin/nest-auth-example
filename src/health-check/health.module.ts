import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCommand } from './health.command';
import { HealthController } from './health.controller';
import { HttpHealthIndicator } from './http-health.indicator';

@Module({
  imports: [ConfigModule, TerminusModule],
  controllers: [HealthController],
  providers: [HttpHealthIndicator, HealthCommand],
  exports: [HttpHealthIndicator],
})
export class HealthModule {}
