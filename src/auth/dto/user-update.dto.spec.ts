import { fc, test } from '@fast-check/vitest';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { useContainer, Validator } from 'class-validator';
import { runSeeders } from 'typeorm-extension';

import dataSourceTest from '../../config/data-source-pglite';
import { User } from '../entities/user.entity';
import { IsRegisteredConstraint } from '../validators/is-registered.validator';
import { UserUpdate } from './user-update.dto';

describe('UserUpdate DTO', () => {
  const validator = new Validator();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync(dataSourceTest.asProvider()),
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [IsRegisteredConstraint],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });

    await module.init();
    await runSeeders(module.get(getDataSourceToken()));
  });

  test('given the update includes the email when the email is the same then it should not be any errors', async () => {
    const errors = await validator.validate(
      plainToClass(UserUpdate, {
        id: '019ede05-8553-714a-8110-8446cfbf70e4',
        name: 'Juan Díaz',
        email: 'john.doe@example.me',
      })
    );

    expect(errors).toHaveLength(0);
  });

  test('given the update includes the email when the email is different to any other emails then it should not be any errors', async () => {
    const errors = await validator.validate(
      plainToClass(UserUpdate, {
        id: '019ede05-8553-714a-8110-8446cfbf70e4',
        name: 'Juan Díaz',
        email: 'john.doe@example.org',
      })
    );

    expect(errors).toHaveLength(0);
  });

  test('given the update includes the email when the email belongs to other user then it should not be valid', async () => {
    const errors = await validator.validate(
      plainToClass(UserUpdate, {
        id: '019ede05-8553-714a-8110-8446cfbf70e4',
        name: 'Juan Díaz',
        email: 'jane.doe@example.me',
      })
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toMatchInlineSnapshot(`
      {
        "isRegistered": "email «jane.doe@example.me» is already taken",
      }
    `);
  });

  test.prop({
    id: fc.uuid({ version: 7 }),
    email: fc
      .emailAddress()
      .filter((email) => email.length > 0 && !email.includes('example')),
    name: fc.lorem(),
  })(
    'given random data when the data is valid then it passes',
    async (data) => {
      const errors = await validator.validate(plainToClass(UserUpdate, data));

      expect(errors).toHaveLength(0);
    }
  );
});
