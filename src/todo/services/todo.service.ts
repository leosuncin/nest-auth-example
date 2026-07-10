import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import type { User } from '../../auth/entities/user.entity';
import type { PaginationQuery } from '../dtos/pagination-query.dto';
import type { TodoCreate } from '../dtos/todo-create.dto';
import type { TodoUpdate } from '../dtos/todo-update.dto';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class TodoService {
  @InjectRepository(Todo)
  private readonly todoRepository!: Repository<Todo>;

  createTodo(newTodo: TodoCreate): Promise<Todo> {
    const todo = this.todoRepository.create(newTodo);

    return this.todoRepository.save(todo);
  }

  listTodo(
    pagination: PaginationQuery,
    owner: User
  ): Promise<[Todo[], number]> {
    return this.todoRepository.findAndCount({
      where: { owner: { id: owner.id } },
      order: { createdAt: 'DESC' },
      skip: pagination.offset,
      take: pagination.limit,
      loadRelationIds: true,
    });
  }

  getTodo(id: Todo['id']): Promise<Todo> {
    return this.todoRepository.findOneOrFail({
      where: { id },
      loadRelationIds: true,
    });
  }

  updateTodo(todo: Todo, updates: TodoUpdate): Promise<Todo> {
    this.todoRepository.merge(todo, updates);

    return this.todoRepository.save(todo);
  }

  removeTodo(todo: Todo): Promise<Todo> {
    return this.todoRepository.remove(todo);
  }
}
