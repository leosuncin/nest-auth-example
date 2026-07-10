import { fc, it } from '@fast-check/vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { TodoUpdate } from './todo-update.dto';

describe('TodoUpdate DTO', () => {
  it.prop({
    done: fc.oneof(
      fc.boolean(),
      fc.constant(1),
      fc.constant('1'),
      fc.constant('true'),
      fc.constant('yes'),
      fc.constant(0),
      fc.constant('0'),
      fc.constant('false'),
      fc.constant('no')
    ),
    text: fc.option(fc.string({ minLength: 2 })),
  })(
    'given a plain object when it is valid then it transforms and validates it correctly',
    (plain) => {
      const instance = plainToInstance(TodoUpdate, plain);

      expect(instance).toBeInstanceOf(TodoUpdate);
      expect(instance).toHaveProperty('text', plain.text);
      expect(instance.done).toBeTypeOf('boolean');

      const errors = validateSync(instance);

      expect(errors).toHaveLength(0);
    }
  );

  it.each([
    [true, true],
    [1, true],
    ['1', true],
    ['true', true],
    ['yes', true],
    ['TRUE', true],
    ['YES', true],
    [false, false],
    [0, false],
    ['0', false],
    ['false', false],
    ['no', false],
    ['FALSE', false],
    ['NO', false],
  ])('given %j as the value of done when it is transformed then it becomes %o', (done, expected) => {
    const instance = plainToInstance(TodoUpdate, { done });

    expect(instance.done).toStrictEqual(expected);
  });
});
