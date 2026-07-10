import { plainToInstance } from 'class-transformer';
import { Validator } from 'class-validator';

import { IsNotEqualTo } from './is-not-equal-to.validator';

class RecordClass {
  readonly username!: string;

  @IsNotEqualTo('username')
  readonly password!: string;
}

describe('IsNotEqualTo Validator', () => {
  const validator = new Validator();

  test.each([
    { username: null, password: null },
    { username: '', password: null },
    { username: null, password: '' },
    { username: '', password: '' },
    { username: null, password: ' ' },
  ])('given the validator runs when %j then it passes', async (plain) => {
    const testRecord = plainToInstance(RecordClass, plain);

    const result = await validator.validate(testRecord);

    expect(result).toHaveLength(0);
  });

  test('given the validator is executed when the property values are different then it passes', async () => {
    const testRecord = plainToInstance(RecordClass, {
      username: 'user1',
      password: 'user2',
    });

    const result = await validator.validate(testRecord);

    expect(result.length).toBe(0);
  });

  test('given the validator is executed when the property values are equal then it fails', async () => {
    const testRecord = plainToInstance(RecordClass, {
      username: 'user1',
      password: 'user1',
    });

    const result = await validator.validate(testRecord);

    expect(result.length).toBe(1);
    expect(result[0]).toMatchInlineSnapshot(`
      ValidationError {
        "children": [],
        "constraints": {
          "isNotEqualTo": "password must be different than username",
        },
        "property": "password",
        "target": RecordClass {
          "password": "user1",
          "username": "user1",
        },
        "value": "user1",
      }
    `);
  });
});
