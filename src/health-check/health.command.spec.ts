import { ConfigService } from '@nestjs/config';
import {
  HealthIndicatorService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import type { TestingModule } from '@nestjs/testing';
import { type Mocked, mock } from '@suites/doubles.vitest';
import { CommandTestFactory } from 'nest-commander-testing';
import nock from 'nock';
import { vi } from 'vitest';

import { HealthCommand } from './health.command';
import { HttpHealthIndicator } from './http-health.indicator';

describe('HealthCommand', () => {
  let command: TestingModule;
  let ormIndicator: Mocked<TypeOrmHealthIndicator>;

  beforeEach(async () => {
    command = await CommandTestFactory.createTestingCommand({
      imports: [],
      providers: [
        HealthIndicatorService,
        { provide: TypeOrmHealthIndicator, useFactory: mock },
        {
          provide: ConfigService,
          useValue: mock<ConfigService>({
            get() {
              return 3000;
            },
          }),
        },
        HttpHealthIndicator,
        HealthCommand,
      ],
    }).compile();

    ormIndicator = await command.resolve(TypeOrmHealthIndicator);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('given the health commmand is executed when health state is healthy then it prints to stdout', async () => {
    const infoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    nock('http://localhost:3000')
      .get('/health')
      .reply(200, {
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
          mem_rss: {
            status: 'up',
          },
          mem_heap: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
          mem_rss: {
            status: 'up',
          },
          mem_heap: {
            status: 'up',
          },
        },
      });
    ormIndicator.pingCheck.mockResolvedValue({ database: { status: 'up' } });

    await CommandTestFactory.run(command, ['health']);

    expect(infoSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('given the health commmand is executed when health state is unhealthy then it prints to stderr', async () => {
    const infoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    ormIndicator.pingCheck.mockRejectedValue({ database: { status: 'down' } });
    nock('http://localhost:3000')
      .get('/health')
      .reply(503, {
        status: 'error',
        info: {
          mem_rss: {
            status: 'up',
          },
          mem_heap: {
            status: 'up',
          },
        },
        error: {
          database: {
            status: 'down',
          },
        },
        details: {
          mem_rss: {
            status: 'up',
          },
          mem_heap: {
            status: 'up',
          },
          database: {
            status: 'down',
          },
        },
      });

    await CommandTestFactory.run(command, ['health']);

    expect(errorSpy).toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
