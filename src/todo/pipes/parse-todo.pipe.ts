import { Inject, Injectable, type PipeTransform } from '@nestjs/common';

import { TodoService } from '../services/todo.service';

@Injectable()
export class ParseTodoPipe implements PipeTransform {
  @Inject(TodoService)
  private readonly todoService: TodoService;

  transform(value: number) {
    return this.todoService.getTodo(value);
  }
}
