import { check, fail, group } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';
import formUrlencoded from 'https://jslib.k6.io/form-urlencoded/3.0.0/index.js';
import faker from 'https://unpkg.com/faker@5.1.0/dist/faker.js';

const createTodoFailedRate = new Rate('failed create todo request');
const updateTodoFailedRate = new Rate('failed update todo request');
const doneTodoFailedRate = new Rate('failed mark todo as done request');
const pendingTodoFailedRate = new Rate('failed mark todo as pending request');
const deleteTodoFailedRate = new Rate('failed delete todo request');

export function requestTodoWorkflow(baseUrl, token) {
  group('Create a new todo', () => {
    const payload = formUrlencoded({ text: faker.lorem.sentence() });
    const params = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    };

    const res = http.post(
      `${baseUrl}/todo`,
      payload,
      Object.assign({ responseType: 'text' }, params),
    );

    const result = check(res, {
      'Todo created successfully': res => res.status === 201,
      'JSON response': res => /json/.test(res.headers['Content-Type']),
    });

    if (!result) {
      createTodoFailedRate.add(1);
      fail('failed to create one todo');
    }

    const todo = res.json();

    group('Get one todo', () => {
      const res = http.get(`${baseUrl}/todo/${todo.id}`, params);

      check(res, {
        'Todo retrieved successfully': res => res.status === 200,
        'JSON response': res => /json/.test(res.headers['Content-Type']),
      });
    });

    group('Update one todo', () => {
      const payload = formUrlencoded({ text: faker.lorem.sentence() });
      const res = http.put(`${baseUrl}/todo/${todo.id}`, payload, params);

      const result = check(res, {
        'Todo updated successfully': res => res.status === 200,
        'JSON response': res => /json/.test(res.headers['Content-Type']),
      });
      updateTodoFailedRate.add(!result);
    });

    group('Mark one todo as done', () => {
      const res = http.patch(`${baseUrl}/todo/${todo.id}/done`, null, params);

      const result = check(res, {
        'Todo marked as done successfully': res => res.status === 200,
        'JSON response': res => /json/.test(res.headers['Content-Type']),
      });
      doneTodoFailedRate.add(!result);

      group('Mark one todo as pending', () => {
        const res = http.patch(
          `${baseUrl}/todo/${todo.id}/pending`,
          null,
          params,
        );

        const result = check(res, {
          'Todo marked as pending successfully': res => res.status === 200,
          'JSON response': res => /json/.test(res.headers['Content-Type']),
        });
        pendingTodoFailedRate.add(!result);

        group('Remove one todo', () => {
          const res = http.del(`${baseUrl}/todo/${todo.id}`, null, params);

          const result = check(res, {
            'Todo removed successfully': res => res.status === 204,
          });

          deleteTodoFailedRate.add(!result);
        });
      });
    });
  });
}

export function requestUnauthorizedTodo(baseUrl) {
  group('Require authentication', () => {
    const responses = http.batch([
      {
        url: `${baseUrl}/todo`,
        method: 'POST',
        body: {
          text: 'Hack the server',
        },
        params: {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      },
      {
        url: `${baseUrl}/todo`,
        method: 'GET',
      },
      {
        url: `${baseUrl}/todo/2`,
        method: 'GET',
      },
      {
        url: `${baseUrl}/todo/2`,
        method: 'PUT',
        body: {
          text: 'You have been hacked',
        },
        params: {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      },
      {
        url: `${baseUrl}/todo/2/done`,
        method: 'PATCH',
      },
      {
        url: `${baseUrl}/todo/2/pending`,
        method: 'PATCH',
      },
      {
        url: `${baseUrl}/todo/2`,
        method: 'DELETE',
      },
    ]);

    check(responses, {
      'status is UNAUTHORIZED': responses =>
        responses.every(({ status }) => status === 401),
    });
  });
}

export function requestListTodo(baseUrl, token) {
  const params = {
    responseType: 'text',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  group('List all todos', () => {
    const res = http.get(`${baseUrl}/todo`, params);

    const result = check(res, {
      'Todo listed successfully': res => res.status === 200,
      'JSON response': res => /json/.test(res.headers['Content-Type']),
      'Todo list is array': res => Array.isArray(res.json()),
    });
    createTodoFailedRate.add(!result);
  });
}
