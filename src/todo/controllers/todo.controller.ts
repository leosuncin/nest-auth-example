import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthUser } from '../../auth/decorators/user.decorator';
import type { User } from '../../auth/entities/user.entity';
import { JWTAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
// biome-ignore lint/style/useImportType: Reflect metadata
import { PaginationQuery } from '../dtos/pagination-query.dto';
// biome-ignore lint/style/useImportType: Reflect metadata
import { TodoCreate } from '../dtos/todo-create.dto';
// biome-ignore lint/style/useImportType: Reflect metadata
import { TodoUpdate } from '../dtos/todo-update.dto';
import type { Todo } from '../entities/todo.entity';
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
  @Inject(TodoService)
  private readonly service!: TodoService;

  @Post()
  createTodo(
    @Body() newTodo: TodoCreate,
    @AuthUser() user: User
  ): Promise<Todo> {
    newTodo.owner = user;

    return this.service.createTodo(newTodo);
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  listTodo(
    @Query() pagination: PaginationQuery,
    @AuthUser() user: User
  ): Promise<[Todo[], number]> {
    return this.service.listTodo(pagination, user);
  }

  @Get(':id')
  getTodo(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: Todo['id']
  ): Promise<Todo> {
    return this.service.getTodo(id);
  }

  @Put(':id')
  updateTodo(
    @Param('id', new ParseUUIDPipe({ version: '7' }), ParseTodoPipe) todo: Todo,
    @Body() updates: TodoUpdate
  ): Promise<Todo> {
    return this.service.updateTodo(todo, updates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTodo(
    @Param('id', new ParseUUIDPipe({ version: '7' }), ParseTodoPipe) todo: Todo
  ): Promise<Todo> {
    return this.service.removeTodo(todo);
  }

  @Patch(':id/done')
  markTodoAsDone(
    @Param('id', new ParseUUIDPipe({ version: '7' }), ParseTodoPipe) todo: Todo
  ): Promise<Todo> | Todo {
    if (todo.done) {
      return todo;
    }

    return this.service.updateTodo(todo, { done: true });
  }

  @Patch(':id/pending')
  markTodoAsPending(
    @Param('id', new ParseUUIDPipe({ version: '7' }), ParseTodoPipe) todo: Todo
  ): Promise<Todo> | Todo {
    if (!todo.done) {
      return todo;
    }

    return this.service.updateTodo(todo, { done: false });
  }
}
