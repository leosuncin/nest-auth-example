import {
  HealthCheckService,
  HealthIndicatorFunction,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    })
      .useMocker(token => {
        const getStatus = (key: string) => ({ [key]: { status: 'up' } });

        if (Object.is(token, HealthCheckService)) {
          return createMock<HealthCheckService>({
            check: jest
              .fn()
              .mockImplementation((indicators: HealthIndicatorFunction[]) =>
                Promise.all(indicators.map(indicator => indicator())),
              ),
          });
        }

        if (Object.is(token, TypeOrmHealthIndicator)) {
          return createMock<TypeOrmHealthIndicator>({
            pingCheck: jest.fn().mockImplementation(getStatus),
          });
        }

        if (Object.is(token, MemoryHealthIndicator)) {
          return createMock<MemoryHealthIndicator>({
            checkHeap: jest.fn().mockImplementation(getStatus),
            checkRSS: jest.fn().mockImplementation(getStatus),
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
      Array [
        Object {
          "db": Object {
            "status": "up",
          },
        },
        Object {
          "mem_rss": Object {
            "status": "up",
          },
        },
      ]
    `);
  });
});
