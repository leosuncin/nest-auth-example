import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Todo } from './todo.entity';
import { TodoCreate } from './todo-create.dto';
import { User } from '../user/user.entity';
import { TodoUpdate } from './todo-update.dto';
import { PaginationQuery } from './pagination-query.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly repo: Repository<Todo>,
  ) {}

  createTodo(newTodo: TodoCreate): Promise<Todo> {
    const todo = this.repo.create(newTodo);

    return this.repo.save(todo);
  }

  listTodo(
    pagination: PaginationQuery,
    owner: User,
  ): Promise<[Todo[], number]> {
    return this.repo.findAndCount({
      where: { owner: { id: owner.id } },
      order: { createdAt: 'DESC' },
      skip: pagination.offset,
      take: pagination.limit,
      loadRelationIds: true,
    });
  }

  getTodo(id: number): Promise<Todo> {
    return this.repo.findOneOrFail({
      where: { id },
      loadRelationIds: true,
    });
  }

  updateTodo(todo: Todo, updates: TodoUpdate): Promise<Todo> {
    this.repo.merge(todo, updates);

    return this.repo.save(todo);
  }

  removeTodo(todo: Todo): Promise<Todo> {
    return this.repo.remove(todo);
  }
}
