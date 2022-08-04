import { check, fail, group, sleep } from 'k6';
import http from 'k6/http';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

import { requestLogin, requestMe, requestRegister } from './auth.js';
import { requestProfile, requestUpdateProfile } from './profile.js';
import {
  requestListTodo,
  requestTodoWorkflow,
  requestUnauthorizedTodo,
} from './todo.js';

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 300,
  duration: '60s',
  discardResponseBodies: true,
  thresholds: {
    checks: ['rate>0.9'],
    'failed login request': ['rate < 0.1'],
    'failed register request': ['rate < 0.1'],
    'failed update profile request': ['rate < 0.1'],
    'failed create todo request': ['rate < 0.1'],
    'failed update todo request': ['rate < 0.1'],
    'failed mark todo as done request': ['rate < 0.1'],
    'failed mark todo as pending request': ['rate < 0.1'],
    'failed delete todo request': ['rate < 0.1'],
  },
};

export function setup() {
  const res = http.post(`${baseUrl}/auth/login`, {
    email: 'jane@doe.me',
    password: 'Pa$$w0rd',
  });

  if (!res.headers.Authorization) fail('Failed to login');

  const [, token] = res.headers.Authorization.split(/\s+/);

  return { token };
}

export function handleSummary(data) {
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

export default function (data) {
  const res = http.get(`${baseUrl}/health`, { responseType: 'text' });

  check(res, {
    'app is healthy': res => res.json('status') === 'ok',
    'db is connected': res => res.json('details.db.status') === 'up',
    'memory is enough': res => res.json('details.mem_rss.status') === 'up',
  });
  group('Authorization', () => {
    requestLogin(baseUrl);
    requestRegister(baseUrl);
    requestMe(baseUrl, data.token);
  });
  group('User profile', () => {
    requestProfile(baseUrl, data.token);
    requestUpdateProfile(baseUrl, data.token);
  });
  group('Todo', () => {
    requestTodoWorkflow(baseUrl, data.token);
    requestListTodo(baseUrl, data.token);
    requestUnauthorizedTodo(baseUrl);
  });
  sleep(1);
}
