import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { runSeeders } from 'typeorm-extension';

import { AppModule } from '../app.module';
import { john } from '../auth/seeders/user.seeder';
import { AuthService } from '../auth/services/auth.service';
import dataSource from '../config/data-source';
import dataSourceTest from '../config/data-source-pglite';
import { setup } from '../setup';
import type { Pagination } from './dtos/pagination.dto';
import { Todo } from './entities/todo.entity';
import { TodoCreateFactory } from './factories/todo-create.factory';
import { TodoUpdateFactory } from './factories/todo-update.factory';
import { janeTodo, johnTodo } from './seeders/todo.seeder';

describe('TodoModule (integration)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(dataSource.KEY)
      .useValue(dataSourceTest())
      .compile();

    app = setup(module.createNestApplication());

    await app.init();

    token = app.get(AuthService).signToken(john);
  });

  beforeEach(async () => {
    await runSeeders(app.get(getDataSourceToken()));
  });

  afterAll(async () => {
    await app.close();
  });

  test('given a POST request to /todo when the data is valid then it creates a new todo', async () => {
    const data = TodoCreateFactory.buildOne();
    const response = await request(app.getHttpServer())
      .post('/todo')
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('text', data.text);
    expect(response.body).toHaveProperty('done', false);
  });

  test('given a POST request to /todo when the data is invalid then it fails to create a new todo', async () => {
    const response = await request(app.getHttpServer())
      .post('/todo')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    expect(response.body).toHaveProperty(
      'message',
      expect.arrayContaining([expect.any(String)])
    );
  });

  test('given a POST request to /todo when the the user is not authenticated then it rejects it', async () => {
    const data = TodoCreateFactory.buildOne();
    const response = await request(app.getHttpServer())
      .post('/todo')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  test('given a GET request to /todo when the user is authenticated then it lists all todos that belong to the user', async () => {
    const response = await request(app.getHttpServer())
      .get('/todo')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);
    const totalTodos: number = await app
      .get(getRepositoryToken(Todo))
      .count({ where: { owner: john } });
    const totalPages = Math.ceil(totalTodos / 10);

    expect(response.body).toMatchObject<Pagination<Todo>>({
      items: expect.any(Array),
      meta: {
        itemCount: 10,
        totalItems: totalTodos,
        itemsPerPage: 10,
        totalPages,
        currentPage: 1,
      },
      links: {
        first: expect.stringContaining('/todo'),
        next: expect.stringContaining('/todo?page=2'),
        last: expect.stringContaining(`/todo?page=${totalPages}`),
      },
    });
  });

  test('given a GET request to /todo when the the user is not authenticated then it rejects it', async () => {
    const response = await request(app.getHttpServer())
      .get('/todo')
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  test('given a GET request to /todo/:id when the user is authenticated then it gets one todo that belongs to the user', async () => {
    const response = await request(app.getHttpServer())
      .get(`/todo/${johnTodo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('id', johnTodo.id);
    expect(response.body).toHaveProperty('text', johnTodo.text);
    expect(response.body).toHaveProperty('done', johnTodo.done);
    expect(response.body).not.toHaveProperty('owner');
  });

  test('given a GET request to /todo/:id when the todo does not belong to the user then it fails to get it', async () => {
    const response = await request(app.getHttpServer())
      .get(`/todo/${janeTodo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "error": "Forbidden",
        "message": "Todo does not belong to you",
        "statusCode": 403,
      }
    `);
  });

  test('given a GET request to /todo/:id when the the user is not authenticated then it rejects it', async () => {
    const response = await request(app.getHttpServer())
      .get(`/todo/${johnTodo.id}`)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  test('given a PUT request to /todo/:id when the user is authenticated then it updates one todo that belongs to the user', async () => {
    const data = TodoUpdateFactory.buildOne();
    const response = await request(app.getHttpServer())
      .put(`/todo/${johnTodo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .type('form')
      .send(data)
      .expect(HttpStatus.OK);

    expect(response.body).not.toHaveProperty('owner');
    expect(response.body).toHaveProperty('done', data.done);
  });

  test('given a PUT request to /todo/:id when the todo does not belong to the user then it fails to update the todo', async () => {
    const data = TodoUpdateFactory.buildOne();
    const response = await request(app.getHttpServer())
      .put(`/todo/${janeTodo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(HttpStatus.FORBIDDEN);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "error": "Forbidden",
        "message": "Todo does not belong to you",
        "statusCode": 403,
      }
    `);
  });

  test('given a PUT request to /todo/:id when the the user is not authenticated then it rejects it', async () => {
    const data = TodoUpdateFactory.buildOne();
    const response = await request(app.getHttpServer())
      .put(`/todo/${johnTodo.id}`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  test('given a DELETE request to /todo/:id when the todo belongs to the user then it removes the todo', async () => {
    await request(app.getHttpServer())
      .delete(`/todo/${johnTodo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NO_CONTENT);

    const count = await app
      .get(getRepositoryToken(Todo))
      .count({ where: { id: johnTodo.id } });

    expect(count).toBe(0);
  });

  test('given a DELETE request to /todo/:id when the todo does not belong to the user then it rejects to remove the todo', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/todo/${janeTodo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "error": "Forbidden",
        "message": "Todo does not belong to you",
        "statusCode": 403,
      }
    `);
  });

  test('given a DELETE request to /todo/:id when the the user is not authenticated then it rejects it', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/todo/${johnTodo.id}`)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  test('given a PATCH request to /todo/:id/done when the todo belongs to the user then it marks the todo as done', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/todo/${johnTodo.id}/done`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('done', true);
  });

  test('given a PATCH request to /todo/:id/done when the todo does not belong to the user then it rejects to mark the todo as done', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/todo/${janeTodo.id}/done`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "error": "Forbidden",
        "message": "Todo does not belong to you",
        "statusCode": 403,
      }
    `);
  });

  test('given a PATCH request to /todo/:id/done when the the user is not authenticated then it rejects it', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/todo/${johnTodo.id}/done`)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  test('given a PATCH request to /todo/:id/pending when the todo belongs to the user then it marks the todo as pending', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/todo/${johnTodo.id}/pending`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('done', false);
  });

  test('given a PATCH request to /todo/:id/pending when the todo does not belong to the user then it rejects to mark the todo as pending', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/todo/${janeTodo.id}/pending`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "error": "Forbidden",
        "message": "Todo does not belong to you",
        "statusCode": 403,
      }
    `);
  });

  test('given a PATCH request to /todo/:id/pending when the the user is not authenticated then it rejects it', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/todo/${johnTodo.id}/pending`)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });
});
