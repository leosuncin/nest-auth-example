import http from 'k6/http';
import { sleep, check } from 'k6';

import { requestLogin, requestRegister } from './auth.js';

const baseUrl = 'http://localhost:3000';

export const options = {
  vus: 300,
  duration: '30s',
  discardResponseBodies: true,
  thresholds: {
    checks: ['rate>0.9'],
    'failed login request': ['rate < 0.1'],
    'failed register request': ['rate < 0.1'],
  },
};

export default function () {
  const res = http.get(baseUrl);

  check(res, {
    'status is OK': res => res.status === 200,
  });
  requestLogin(baseUrl);
  requestRegister(baseUrl);
  sleep(1);
}
