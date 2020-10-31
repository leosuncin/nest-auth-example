import { check } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';
import faker from 'https://unpkg.com/faker@5.1.0/dist/faker.js';

const updateProfileFailedRate = new Rate('faile update profile request');

export function requestProfile(baseUrl, token) {
  const res = http.get(`${baseUrl}/profile/2`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(res, {
    'Show user profile': res => res.status === 200,
  });
}

export function requestUpdateProfile(baseUrl, token) {
  const payload = JSON.stringify({ name: faker.name.findName() });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  const res = http.put(`${baseUrl}/profile/2`, payload, params);

  const result = check(res, {
    'Update user profile': res => res.status === 200,
  });
  updateProfileFailedRate.add(!result);
}
