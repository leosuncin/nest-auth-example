import { check } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';
import faker from 'https://unpkg.com/faker@5.1.0/dist/faker.js';

const loginFailedRate = new Rate('failed login request');
const registerFailedRate = new Rate('failed register request');
const emailDomain =  Math.random().toString(36).substring(2, 15) + '.lol';

/**
 * Send a login request
 *
 * @param {string} baseUrl
 */
export function requestLogin(baseUrl) {
  const payload = JSON.stringify({
    email: 'john@doe.me',
    password: 'Pa$$w0rd',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const res = http.post(`${baseUrl}/auth/login`, payload, params);

  const result = check(res, {
    'Login successfully': res => res.status === 200,
    'Authorization header': /Bearer\s+.*/.test(res.headers.Authorization),
    'JSON response': res => /json/.test(res.headers['Content-Type']),
  });
  loginFailedRate.add(!result);
}

/**
 * Send a register request
 *
 * @param {string} baseUrl
 */
export function requestRegister(baseUrl) {
  const payload = JSON.stringify({
    name: faker.name.findName(),
    email: `stress_${__VU}+${__ITER}@${emailDomain}`,
    password: faker.internet.password(),
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const res = http.post(`${baseUrl}/auth/register`, payload, params);

  const result = check(res, {
    'Register successfully': res => res.status === 201,
    'Authorization header': /Bearer\s+.*/.test(res.headers.Authorization),
    'JSON response': res => /json/.test(res.headers['Content-Type']),
  });
  registerFailedRate.add(!result);
}

/**
 * Get the user session
 *
 * @param {string} baseUrl Base URL
 * @param {string} token JWT
 */
export function requestMe(baseUrl, token) {
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = http.get(`${baseUrl}/auth/me`, params);

  check(res, {
    'Get user session': res => res.status === 200,
  });
}
