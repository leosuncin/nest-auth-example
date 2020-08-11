import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  ForbiddenException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';

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

  @Get()
  listTodo(@AuthUser() user: User): Promise<Todo[]> {
    return this.service.listTodo(user);
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getTodo(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User,
  ): Promise<Todo> {
    const todo = await this.service.getTodo(id);

    if (!todo) throw new NotFoundException(`Not found any todo with id: ${id}`);

    if (todo.owner !== user.id)
      throw new ForbiddenException(`Todo does not belong to you`);

    return todo;
  }
}
