import {
  HealthCheckService,
  HealthIndicator,
  HealthIndicatorFunction,
  MemoryHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';

class MockHealthIndicator extends HealthIndicator {
  public pingCheck(key: string) {
    return super.getStatus(key, true, { message: 'Up' });
  }

  public checkRSS(key: string) {
    return super.getStatus(key, true, { message: 'Up' });
  }
}

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      imports: [TerminusModule],
    })
      .overrideProvider(HealthCheckService)
      .useValue({
        check(indicators: HealthIndicatorFunction[]) {
          return Promise.resolve(indicators.map(indicator => indicator()));
        },
      })
      .overrideProvider(TypeOrmHealthIndicator)
      .useClass(MockHealthIndicator)
      .overrideInterceptor(MemoryHealthIndicator)
      .useClass(MockHealthIndicator)
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should check health', async () => {
    await expect(controller.check()).resolves.toBeDefined();
  });
});
