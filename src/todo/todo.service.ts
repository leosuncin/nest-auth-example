import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Todo } from './todo.entity';
import { TodoCreate } from './todo-create.dto';
import { User } from '../user/user.entity';
import { TodoUpdate } from './todo-update.dto';

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

  listTodo(owner: User): Promise<Todo[]> {
    return this.repo.find({ where: { owner }, order: { createdAt: 'DESC' } });
  }

  async getTodo(id: number, owner: User): Promise<Todo> {
    const todo = await this.repo.findOne(id, { loadRelationIds: true });

    if (!todo) throw new NotFoundException(`Not found any todo with id: ${id}`);

    if (todo.owner !== owner.id)
      throw new ForbiddenException(`Todo does not belong to you`);

    return todo;
  }

  updateTodo(todo: Todo, updates: TodoUpdate): Promise<Todo> {
    Object.assign(todo, updates);

    return this.repo.save(todo);
  }

  removeTodo(todo: Todo): Promise<Todo> {
    return this.repo.remove(todo);
  }
}
