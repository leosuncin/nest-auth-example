import { Inject, Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class HttpHealthIndicator {
  @Inject(HealthIndicatorService)
  private readonly healthIndicator!: HealthIndicatorService;

  /**
   * Checks if the given url response in the given timeout
   * and returns a result object corresponding to the result
   * @param key The key which will be used for the result object
   * @param url The url which should be request
   *
   * @example
   * httpHealthIndicator.pingCheck('google', 'https://google.com', { timeout: 800 })
   */
  async pingCheck<Key extends string>(
    key: Key,
    url: string
  ): Promise<HealthIndicatorResult<Key>> {
    const check = this.healthIndicator.check(key);

    try {
      const now = performance.now();
      const response = await fetch(url, { method: 'HEAD' });
      const duration = performance.now() - now;

      if (!response.ok) {
        return check.down({
          message: `${url} is unreachable`,
          statusCode: response.status,
          statusText: response.statusText,
        });
      }

      return check.up({
        responseTime: duration,
      });
    } catch (error) {
      if (error instanceof Error) {
        return check.down(error.message);
      }

      throw error;
    }
  }

  /**
   * Checks if the url responds with a successful state and
   * returns a result object corresponding to the result.
   * @param key The key which will be used for the result object
   * @param url The url which should be requested
   *
   * @example
   * httpHealthIndicator.responseCheck('api', 'http://localhost.com/health')
   */
  async healthCheck<Key extends string>(
    key: Key,
    url: string
  ): Promise<HealthIndicatorResult<Key>> {
    const check = this.healthIndicator.check(key);

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (!response.ok) {
        return check.down({
          message: `${key} is unhealthy`,
          statusCode: response.status,
          statusText: response.statusText,
          health: json,
        });
      }

      return check.up({
        health: json,
      });
    } catch (error) {
      if (error instanceof Error) {
        return check.down(error.message);
      }

      throw error;
    }
  }
}
