import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type Mocked, mock } from '@suites/doubles.vitest';
import { plainToClass } from 'class-transformer';
import { useContainer, Validator } from 'class-validator';
import type { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import {
  IsRegistered,
  IsRegisteredConstraint,
} from './is-registered.validator';

class NewRecordClass {
  @IsRegistered()
  readonly email!: string;
}

class EditRecordClass {
  readonly id!: User['id'];

  @IsRegistered()
  readonly email!: string;

  // @ts-expect-error For testing purposes only
  @IsRegistered()
  readonly name!: string;
}

describe('IsRegistered Validator', () => {
  const validator = new Validator();
  let userRepositoryMocked: Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IsRegisteredConstraint,
        {
          provide: getRepositoryToken(User),
          useFactory() {
            return mock<Repository<User>>();
          },
        },
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });

    userRepositoryMocked = module.get(getRepositoryToken(User));
  });

  test('given a new record when the email is not registered then it passes', async () => {
    userRepositoryMocked.countBy.mockResolvedValue(0);

    const errors = await validator.validate(
      plainToClass(NewRecordClass, { email: 'Frida_Sanford1@example.net' })
    );

    expect(errors).toHaveLength(0);
    expect(userRepositoryMocked.countBy).toHaveBeenCalled();
  });

  test('given a new record when the email is already registered then it fails', async () => {
    userRepositoryMocked.countBy.mockResolvedValue(1);

    const errors = await validator.validate(
      plainToClass(NewRecordClass, { email: 'Marilyne70@example.org' })
    );

    expect(errors).toHaveLength(1);
    expect(userRepositoryMocked.countBy).toHaveBeenCalled();
    expect(errors[0].constraints).toMatchInlineSnapshot(`
      {
        "isRegistered": "email «Marilyne70@example.org» is already registered",
      }
    `);
  });

  test('given a new record when the email is empty then it passes', async () => {
    const errors = await validator.validate(
      plainToClass(NewRecordClass, { email: '' })
    );

    expect(errors).toHaveLength(0);
    expect(userRepositoryMocked.countBy).not.toHaveBeenCalled();
  });

  test('given an existing record when the email is not taken then it passes', async () => {
    userRepositoryMocked.countBy.mockResolvedValue(0);

    const errors = await validator.validate(
      plainToClass(EditRecordClass, {
        id: '56096f26-95c7-4230-a383-deeb73297ba5',
        email: 'Frida_Sanford1@example.net',
      })
    );

    expect(errors).toHaveLength(0);
    expect(userRepositoryMocked.countBy).toHaveBeenCalled();
  });

  test('given an existing record when the email is already taken then it fails', async () => {
    userRepositoryMocked.countBy.mockResolvedValue(1);

    const errors = await validator.validate(
      plainToClass(EditRecordClass, {
        id: 'd2a3006c-fc50-491c-912e-74d19b2afbfe',
        email: 'Marilyne70@example.org',
      })
    );

    expect(errors).toHaveLength(1);
    expect(userRepositoryMocked.countBy).toHaveBeenCalled();
    expect(errors[0].constraints).toMatchInlineSnapshot(`
      {
        "isRegistered": "email «Marilyne70@example.org» is already taken",
      }
    `);
  });

  test('given an existing record when the email is empty then it passes', async () => {
    const errors = await validator.validate(
      plainToClass(EditRecordClass, {
        id: '19342393-bb62-4de6-b1de-f18b33e7b2b4',
        email: '',
      })
    );

    expect(errors).toHaveLength(0);
    expect(userRepositoryMocked.countBy).not.toHaveBeenCalled();
  });

  test('given a record when the property is not the email then it passes', async () => {
    userRepositoryMocked.countBy.mockResolvedValue(0);

    const errors = await validator.validate(
      plainToClass(EditRecordClass, {
        id: '837183cd-9112-41c9-adbd-a4d0790126d1',
        name: 'Ismael Franey',
        email: 'Ismael_Franey17@example.com',
      })
    );

    expect(errors).toHaveLength(0);
    expect(userRepositoryMocked.countBy).toHaveBeenCalledTimes(1);
  });
});
