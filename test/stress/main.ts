import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { check, fail, sleep } from 'k6';
import http from 'k6/http';
import type { Options } from 'k6/options';

import { authTest, loginFailedRate, registerFailedRate } from './auth.ts';
import {
  createTodoFailedRate,
  deleteTodoFailedRate,
  doneTodoFailedRate,
  pendingTodoFailedRate,
  todoTest,
  updateTodoFailedRate,
} from './todo.ts';

declare global {
  var __ENV: Record<string, string>;
  var __VU: number;
  var __ITER: number;
}

export const options: Options = {
  scenarios: {
    rampingLoad: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },
      ],
      exec: 'rampingLoad',
    },
    spikeLoad: {
      executor: 'constant-arrival-rate',
      rate: 10,
      maxVUs: 300,
      preAllocatedVUs: 20,
      duration: '2m',
      exec: 'spikeLoad',
      startTime: '1m',
    },
    normalLoad: {
      executor: 'constant-vus',
      vus: 20,
      duration: '4m',
      exec: 'normalLoad',
    },
  },
  thresholds: {
    checks: ['rate>0.9'],
    [loginFailedRate.name]: ['rate < 0.1'],
    [registerFailedRate.name]: ['rate < 0.1'],
    [createTodoFailedRate.name]: ['rate < 0.1'],
    [updateTodoFailedRate.name]: ['rate < 0.1'],
    [doneTodoFailedRate.name]: ['rate < 0.1'],
    [pendingTodoFailedRate.name]: ['rate < 0.1'],
    [deleteTodoFailedRate.name]: ['rate < 0.1'],
  },
};

export function setup() {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const res = http.post(`${baseUrl}/auth/login`, {
    email: 'jane.doe@example.me',
    password: 'Pa$$w0rd',
  });

  if (!res.headers.Authorization) {
    fail('Failed to login');
  }

  const [, token] = res.headers.Authorization.split(' ');

  return { token, baseUrl };
}

export function handleSummary(
  data: Record<string, unknown> | Record<string, unknown>[]
) {
  const stdout = textSummary(data, { indent: ' ', enableColors: !!__ENV.CI });

  return __ENV.CI
    ? {
        'stress-test-result.html': htmlReport(data),
        'stress-test-result.json': JSON.stringify(data, null, 2),
        stdout,
      }
    : {
        stdout,
      };
}

export function rampingLoad(data: Record<string, string>) {
  todoTest(data.baseUrl, data.token);
}

export function spikeLoad(data: Record<string, string>) {
  authTest(data.baseUrl, data.token);
}

export function normalLoad(data: Record<string, string>) {
  const response = http.get(`${data.baseUrl}/health`);

  check(response, {
    app_is_healthy: (res) => res.json('status') === 'ok',
    db_is_connected: (res) => res.json('details.db.status') === 'up',
    memory_is_enough: (res) => res.json('details.mem_rss.status') === 'up',
  });

  sleep(1);
}
