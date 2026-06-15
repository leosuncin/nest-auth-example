import {
  HealthCheckService,
  type HealthIndicatorFunction,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';
import { mock, stub } from '@suites/doubles.jest';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    })
      .useMocker((token) => {
        const getStatus = (key: string) => ({ [key]: { status: 'up' } });

        if (Object.is(token, HealthCheckService)) {
          return mock<HealthCheckService>({
            check: stub((indicators: HealthIndicatorFunction[]) =>
              Promise.all(indicators.map((indicator) => indicator()))
            ),
          });
        }

        if (Object.is(token, TypeOrmHealthIndicator)) {
          return mock<TypeOrmHealthIndicator>({
            pingCheck: stub(getStatus),
          });
        }

        if (Object.is(token, MemoryHealthIndicator)) {
          return mock<MemoryHealthIndicator>({
            checkHeap: stub(getStatus),
            checkRSS: stub(getStatus),
          });
        }
      })
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should check health', async () => {
    await expect(controller.check()).resolves.toMatchInlineSnapshot(`
      [
        {
          "db": {
            "status": "up",
          },
        },
        {
          "mem_rss": {
            "status": "up",
          },
        },
      ]
`);
  });
});
