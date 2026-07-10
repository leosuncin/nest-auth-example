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
  @Inject(MemoryHealthIndicator)
  private readonly mem!: MemoryHealthIndicator;
  @Inject(TypeOrmHealthIndicator)
  private readonly orm!: TypeOrmHealthIndicator;

  @Get()
  @HealthCheck()
  healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.orm.pingCheck('database'),
      () => this.mem.checkRSS('mem_rss', 768 * 2 ** 20 /* 768 MB */),
      () => this.mem.checkHeap('mem_heap', 512 * 2 ** 20 /* 512 MB */),
    ]);
  }
}
