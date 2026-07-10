import { ServiceUnavailableException } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthCheckExecutor } from '@nestjs/terminus/dist/health-check/health-check-executor.service';
import type { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let memIndicator: Mocked<MemoryHealthIndicator>;
  let ormIndicator: Mocked<TypeOrmHealthIndicator>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.sociable(HealthController)
      .expose(HealthCheckService)
      .expose(HealthCheckExecutor)
      .compile();

    controller = unit;
    memIndicator = unitRef.get(
      MemoryHealthIndicator
    ) as unknown as Mocked<MemoryHealthIndicator>;
    ormIndicator = unitRef.get(
      TypeOrmHealthIndicator
    ) as unknown as Mocked<TypeOrmHealthIndicator>;
  });

  test('given the indicators resolves the state when all the indicators are successful then it is healthy', async () => {
    ormIndicator.pingCheck.mockResolvedValue({ database: { status: 'up' } });
    memIndicator.checkRSS.mockResolvedValue({ mem_rss: { status: 'up' } });
    memIndicator.checkHeap.mockResolvedValue({ mem_heap: { status: 'up' } });

    await expect(controller.healthCheck()).resolves.toMatchObject({
      details: {
        database: { status: 'up' },
        mem_heap: { status: 'up' },
        mem_rss: { status: 'up' },
      },
      error: {},
      info: {
        database: { status: 'up' },
        mem_heap: { status: 'up' },
        mem_rss: { status: 'up' },
      },
      status: 'ok',
    });
  });

  test('given the indicators resolves the state when one of the indicators is faulty then it is unhealthy', async () => {
    ormIndicator.pingCheck.mockResolvedValue({
      database: { status: 'down', message: 'Unable to connect' },
    });
    memIndicator.checkRSS.mockResolvedValue({ mem_rss: { status: 'up' } });
    memIndicator.checkHeap.mockResolvedValue({ mem_heap: { status: 'up' } });

    await expect(controller.healthCheck()).rejects.toThrow(
      ServiceUnavailableException
    );
  });
});
