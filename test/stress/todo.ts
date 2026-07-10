import { faker } from 'https://unpkg.com/@faker-js/faker@10.5.0/dist/index.js';
import { check, fail, group } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

declare global {
  var __ENV: Record<string, string>;
  var __VU: number;
  var __ITER: number;
}

export const createTodoFailedRate = new Rate('failed_create_todo');
export const updateTodoFailedRate = new Rate('failed_update_todo');
export const doneTodoFailedRate = new Rate('failed_mark_todo_as_done');
export const pendingTodoFailedRate = new Rate('failed_mark_todo_as_pending');
export const deleteTodoFailedRate = new Rate('failed_delete_todo');

interface Todo {
  createdAt: string;
  done: boolean;
  id: string;
  text: string;
  updatedAt: string;
}

export class TodoClient {
  protected baseUrl: string;
  protected token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  createTodo(text: string) {
    return http.post(`${this.baseUrl}/todo`, JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
    });
  }

  listTodos(page = 1, limit = 10) {
    return http.get(`${this.baseUrl}/todo?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
    });
  }

  getTodo(todoId: string) {
    return http.get(`${this.baseUrl}/todo/${todoId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
    });
  }

  updateTodo(todoId: string, changes: Partial<Pick<Todo, 'done' | 'text'>>) {
    return http.put(`${this.baseUrl}/todo/${todoId}`, JSON.stringify(changes), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
    });
  }

  removeTodo(todoId: string) {
    return http.del(`${this.baseUrl}/todo/${todoId}`, null, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
    });
  }

  markTodoAsDone(todoId: string) {
    return http.patch(`${this.baseUrl}/todo/${todoId}/done`, null, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
    });
  }

  markTodoAsPending(todoId: string) {
    return http.patch(`${this.baseUrl}/todo/${todoId}/pending`, null, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
    });
  }
}

export function todoTest(baseUrl: string, token: string) {
  const client = new TodoClient(baseUrl, token);

  group('Todo workflow', () => {
    let todo: Todo;

    group('Create a new todo', () => {
      const text = faker.hacker.phrase();
      const response = client.createTodo(text);

      const pass = check(response, {
        'Todo created successfully': (res) => res.status === 201,
      });

      createTodoFailedRate.add(!pass);

      if (!pass) {
        fail(`Failed to create a new todo with the status ${response.status}`);
      }

      todo = response.json() as unknown as Todo;
    });

    group('Get one todo', () => {
      const response = client.getTodo(todo.id);

      check(response, {
        'Todo retrieved successfully': (res) => res.status === 200,
      });
    });

    group('List all todos', () => {
      const response = client.listTodos();

      check(response, {
        'Todo listed successfully': (res) => res.status === 200,
      });
    });

    group('Update one todo', () => {
      const changes = { text: faker.lorem.sentence() };
      const response = client.updateTodo(todo.id, changes);

      const result = check(response, {
        'Todo updated successfully': (res) => res.status === 200,
      });

      updateTodoFailedRate.add(!result);
    });

    group('Mark one todo as done', () => {
      const response = client.markTodoAsDone(todo.id);

      const result = check(response, {
        'Todo was marked as done successfully': (res) => res.status === 200,
      });

      doneTodoFailedRate.add(!result);
    });

    group('Mark one todo as pending', () => {
      const response = client.markTodoAsPending(todo.id);

      const result = check(response, {
        'Todo was marked as pending successfully': (res) => res.status === 200,
      });

      pendingTodoFailedRate.add(!result);
    });

    group('Remove one todo', () => {
      const response = client.removeTodo(todo.id);

      const result = check(response, {
        'Todo was removed successfully': (res) => res.status === 204,
      });

      deleteTodoFailedRate.add(!result);
    });
  });
}
