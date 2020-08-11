import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Todo } from './todo.entity';
import { TodoCreate } from './todo-create.dto';
import { User } from '../user/user.entity';

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
    return this.repo.find({ owner });
  }

  getTodo(id: number): Promise<Todo> {
    return this.repo.findOne(id, { loadRelationIds: true });
  }
}
