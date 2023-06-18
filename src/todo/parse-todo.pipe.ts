import { Injectable, PipeTransform } from '@nestjs/common';

import { TodoService } from './todo.service';

@Injectable()
export class ParseTodoPipe implements PipeTransform {
  constructor(private readonly todoService: TodoService) {}

  transform(value: number) {
    return this.todoService.getTodo(value);
  }
}
