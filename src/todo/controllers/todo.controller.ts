import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JWTAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { AuthUser } from '../../user/decorators/user.decorator';
import { User } from '../../user/entities/user.entity';
import { PaginationQuery } from '../dtos/pagination-query.dto';
import { TodoCreate } from '../dtos/todo-create.dto';
import { TodoUpdate } from '../dtos/todo-update.dto';
import { Todo } from '../entities/todo.entity';
import { TodoFilter } from '../filters/todo.filter';
import { IsOwnerInterceptor } from '../interceptors/is-owner.interceptor';
import { PaginationInterceptor } from '../interceptors/pagination.interceptor';
import { ParseTodoPipe } from '../pipes/parse-todo.pipe';
import { TodoService } from '../services/todo.service';

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
