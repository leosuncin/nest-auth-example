import { Controller, Post, UseGuards, Body } from '@nestjs/common';

import { TodoService } from './todo.service';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { TodoCreate } from './todo-create.dto';
import { AuthUser } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { Todo } from './todo.entity';

@Controller('todo')
@UseGuards(SessionAuthGuard, JWTAuthGuard)
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Post()
  createTodo(
    @Body() newTodo: TodoCreate,
    @AuthUser() user: User,
  ): Promise<Todo> {
    newTodo.owner = user;

    return this.service.createTodo(newTodo);
  }
}
