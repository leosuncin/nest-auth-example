import { inspect } from 'node:util';

import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type HealthIndicatorResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Command, CommandRunner } from 'nest-commander';

import { HttpHealthIndicator } from './http-health.indicator';

@Command({
  name: 'health',
  description: 'Check the health of the application',
  options: { isDefault: true },
})
export class HealthCommand extends CommandRunner {
  @Inject(ConfigService)
  private readonly config!: ConfigService;
  @Inject(TypeOrmHealthIndicator)
  private readonly orm!: TypeOrmHealthIndicator;
  @Inject(HttpHealthIndicator)
  private readonly http!: HttpHealthIndicator;

  async run(): Promise<void> {
    const port = this.config.get<number>('PORT', 3000);

    const indicatorResults = await Promise.allSettled([
      this.orm.pingCheck('database'),
      this.http.healthCheck('api', `http://localhost:${port}/health`),
    ]);
    let status: 'up' | 'down' = 'up';
    const info: Record<string, HealthIndicatorResult> = {};
    const error: Record<string, HealthIndicatorResult> = {};

    for (const result of indicatorResults) {
      if (result.status === 'fulfilled') {
        Object.assign(info, result.value);
      } else {
        status = 'down';
        Object.assign(error, result.reason);
      }
    }
    const details: Record<string, HealthIndicatorResult> = {
      ...info,
      ...error,
    };

    if (status === 'down') {
      console.error({
        details,
        error,
        info,
        status,
      });
      process.exitCode = 1;
    } else {
      console.info(
        inspect(
          {
            details,
            error,
            info,
            status,
          },
          { depth: null, colors: true }
        )
      );
    }
  }
}
