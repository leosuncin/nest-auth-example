import { TestBed } from '@suites/unit';
import { ParseTodoPipe } from './parse-todo.pipe';

describe('ParseTodoPipe', () => {
  let pipe: ParseTodoPipe;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(ParseTodoPipe).compile();

    pipe = unit;
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });
});
