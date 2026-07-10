import { faker } from 'https://unpkg.com/@faker-js/faker@10.5.0/dist/index.js';
import { check, fail, group } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

export const loginFailedRate = new Rate('failed_login');
export const registerFailedRate = new Rate('failed_register');

declare global {
  var __ENV: Record<string, string>;
  var __VU: number;
  var __ITER: number;
}

interface SignUp {
  email: string;
  name: string;
  password: string;
}

interface SignIn {
  email: string;
  password: string;
}

export class AuthClient {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  register(data: SignUp) {
    return http.post(`${this.baseUrl}/auth/register`, JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  login(data: SignIn) {
    return http.post(`${this.baseUrl}/auth/login`, JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  me(token: string) {
    return http.get(`${this.baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  }

  updateUser(token: string, data: Partial<SignUp>) {
    return http.put(`${this.baseUrl}/auth/me`, JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  }
}

export function authTest(baseUrl: string, token: string) {
  const authClient = new AuthClient(baseUrl);
  const password = faker.internet.password({ prefix: 'pa$$w0rd', length: 16 });
  const email = faker.internet.email({
    lastName: `k6${__VU}+${__ITER}stress`,
    allowSpecialCharacters: false,
  });

  group('Authentication flow', () => {
    group('Register a new user', () => {
      const response = authClient.register({
        name: `stress k6 user ${__VU}+${__ITER}`,
        email,
        password,
      });

      const pass = check(response, {
        'The registration is successful': (res) => res.status === 201,
      });

      registerFailedRate.add(!pass);

      if (!pass) {
        fail(`Failed to register due to ${response.body}`);
      }
    });

    group('Login with the registered user', () => {
      const response = authClient.login({
        email,
        password,
      });

      const pass = check(response, {
        'The login is successful': (res) => res.status === 200,
      });

      loginFailedRate.add(!pass);
    });

    group('Get the session user', () => {
      const response = authClient.me(token);

      check(response, {
        'The session is valid': (res) => res.status === 200,
      });
    });

    group('Update the user profile', () => {
      const response = authClient.updateUser(token, {
        name: faker.person.fullName(),
        password: faker.internet.password({ prefix: 'pa$$w0rd', length: 16 }),
      });

      check(response, {
        'The profile is updated successfully': (res) => res.status === 200,
      });
    });
  });
}
