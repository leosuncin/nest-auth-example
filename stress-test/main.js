import http from 'k6/http';
import { sleep, check } from 'k6';

const baseUrl = 'http://localhost:3000';

export const options = {
  vus: 300,
  duration: '30s',
};

export default function () {
  const res = http.get(baseUrl);

  check(res, {
    'status is OK': res => res.status === 200,
  });
  sleep(1);
}
