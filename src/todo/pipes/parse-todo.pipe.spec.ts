import { Test } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import { TodoService } from '../services/todo.service';
import { ParseTodoPipe } from './parse-todo.pipe';

describe('ParseTodoPipe', () => {
  let pipe: ParseTodoPipe;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: TodoService,
          useValue: createMock<TodoService>(),
        },
        ParseTodoPipe,
      ],
    }).compile();

    pipe = module.get(ParseTodoPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });
});
