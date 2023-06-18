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
  Query,
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
import { ParseTodoPipe } from './parse-todo.pipe';
import { PaginationInterceptor } from './pagination.interceptor';
import { PaginationQuery } from './pagination-query.dto';

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
  @UseInterceptors(PaginationInterceptor)
  listTodo(
    @Query() pagination: PaginationQuery,
    @AuthUser() user: User,
  ): Promise<[Todo[], number]> {
    return this.service.listTodo(pagination, user);
  }

  @Get(':id')
  getTodo(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.service.getTodo(id);
  }

  @Put(':id')
  updateTodo(
    @Param('id', ParseIntPipe, ParseTodoPipe) todo: Todo,
    @Body() updates: TodoUpdate,
  ): Promise<Todo> {
    return this.service.updateTodo(todo, updates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTodo(
    @Param('id', ParseIntPipe, ParseTodoPipe) todo: Todo,
  ): Promise<Todo> {
    return this.service.removeTodo(todo);
  }

  @Patch(':id/done')
  async markTodoAsDone(
    @Param('id', ParseIntPipe, ParseTodoPipe) todo: Todo,
  ): Promise<Partial<Todo>> {
    if (todo.done) {
      return todo;
    }

    return this.service.updateTodo(todo, { done: true });
  }

  @Patch(':id/pending')
  async markTodoAsPending(
    @Param('id', ParseIntPipe, ParseTodoPipe) todo: Todo,
  ): Promise<Partial<Todo>> {
    if (!todo.done) {
      return todo;
    }

    return this.service.updateTodo(todo, { done: false });
  }
}
