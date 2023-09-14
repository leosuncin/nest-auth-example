import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { PaginationQuery } from '../dtos/pagination-query.dto';
import { TodoCreate } from '../dtos/todo-create.dto';
import { TodoUpdate } from '../dtos/todo-update.dto';
import { Todo } from '../entities/todo.entity';

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
