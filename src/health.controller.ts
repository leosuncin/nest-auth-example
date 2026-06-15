import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  @Inject(HealthCheckService)
  private readonly health!: HealthCheckService;

  @Inject(TypeOrmHealthIndicator)
  private readonly orm!: TypeOrmHealthIndicator;

  @Inject(MemoryHealthIndicator)
  private readonly memory!: MemoryHealthIndicator;

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.orm.pingCheck('db'),
      () => this.memory.checkRSS('mem_rss', 1024 * 2 ** 20 /* 1024 MB */),
    ]);
  }
}
