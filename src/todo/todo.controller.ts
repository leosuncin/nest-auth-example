import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  UseFilters,
} from '@nestjs/common';

import { TodoService } from './todo.service';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { TodoCreate } from './todo-create.dto';
import { AuthUser } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { Todo } from './todo.entity';
import { TodoUpdate } from './todo-update.dto';
import { TodoFilter } from './todo.filter';
import { IsOwnerInterceptor } from './is-owner.interceptor';

@Controller('todo')
@UseGuards(SessionAuthGuard, JWTAuthGuard)
@UseFilters(TodoFilter)
@UseInterceptors(ClassSerializerInterceptor, IsOwnerInterceptor)
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
  getTodo(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.service.getTodo(id);
  }

  @Put(':id')
  async updateTodo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: TodoUpdate,
  ): Promise<Todo> {
    const todo = await this.service.getTodo(id);

    return this.service.updateTodo(todo, updates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTodo(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    const todo = await this.service.getTodo(id);

    return this.service.removeTodo(todo);
  }

  @Patch(':id/done')
  async markTodoAsDone(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Partial<Todo>> {
    const todo = await this.service.getTodo(id);

    if (todo.done) {
      return todo;
    }

    return this.service.updateTodo(todo, { done: true });
  }

  @Patch(':id/pending')
  async markTodoAsPending(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Partial<Todo>> {
    const todo = await this.service.getTodo(id);

    if (!todo.done) {
      return todo;
    }

    return this.service.updateTodo(todo, { done: false });
  }
}
