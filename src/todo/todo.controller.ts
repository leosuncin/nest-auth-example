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
} from '@nestjs/common';

import { TodoService } from './todo.service';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { TodoCreate } from './todo-create.dto';
import { AuthUser } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { Todo } from './todo.entity';
import { TodoUpdate } from './todo-update.dto';

@Controller('todo')
@UseGuards(SessionAuthGuard, JWTAuthGuard)
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
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
    const todo = await this.service.getTodo(id, user);

    return todo;
  }

  @Put(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async updateTodo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: TodoUpdate,
    @AuthUser() user: User,
  ): Promise<Todo> {
    const todo = await this.service.getTodo(id, user);

    return this.service.updateTodo(todo, updates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTodo(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User,
  ): Promise<Todo> {
    const todo = await this.service.getTodo(id, user);

    return this.service.removeTodo(todo);
  }

  @Patch(':id/done')
  async markTodoAsDone(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User,
  ): Promise<Partial<Todo>> {
    const todo = await this.service.getTodo(id, user);

    if (todo.done) {
      return { done: todo.done };
    }

    await this.service.updateTodo(todo, { done: true });

    return { done: todo.done, updatedAt: todo.updatedAt };
  }

  @Patch(':id/pending')
  async markTodoAsPending(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User,
  ): Promise<Partial<Todo>> {
    const todo = await this.service.getTodo(id, user);

    if (!todo.done) {
      return { done: todo.done };
    }

    await this.service.updateTodo(todo, { done: false });

    return { done: todo.done, updatedAt: todo.updatedAt };
  }
}
