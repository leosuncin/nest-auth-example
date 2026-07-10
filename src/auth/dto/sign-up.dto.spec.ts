import { fc, test } from '@fast-check/vitest';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { useContainer, Validator } from 'class-validator';
import { getPGliteInstance } from 'typeorm-pglite';

import dataSourceTest from '../../config/data-source-pglite';
import { User } from '../entities/user.entity';
import { IsRegisteredConstraint } from '../validators/is-registered.validator';
import { SignUp } from './sign-up.dto';

describe('SignUp DTO', () => {
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

    const instance = await getPGliteInstance();
    await instance.exec(
      `INSERT INTO "user" (email, name, password) VALUES ('Marilyn70@example.org', 'Marilyn Cote', '') ON CONFLICT (email) DO NOTHING`
    );
  });

  test('given valid data when the email is not registered then it passes', async () => {
    const errors = await validator.validate(
      plainToClass(SignUp, {
        email: 'frida_sanford1@example.net',
        name: 'Frida Sanford',
        password: '$$kyd!v3r-h!ccup$-TYP3',
      })
    );

    expect(errors).toHaveLength(0);
  });

  test('given valid data when the email is already registered then it fails', async () => {
    const errors = await validator.validate(
      plainToClass(SignUp, {
        email: 'Marilyn70@example.org',
        name: 'Marilyn Cote',
        password: 'Att@chM3r3lyD@rl!ng',
      })
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toMatchInlineSnapshot(`
      {
        "isRegistered": "email «Marilyn70@example.org» is already registered",
      }
    `);
  });

  test.prop({
    email: fc.emailAddress(),
    name: fc.string({ minLength: 3 }),
    password: fc.string({
      minLength: 1,
      maxLength: 2,
      unit: fc.constantFrom(
        '#Ht3ouW5!t8WU!KH',
        'J4M$Fu38IH$1mG6c',
        'S@7@3ied$8@S2CC!',
        'iGT7L&j#mY!^2VXP',
        'DZ%r@@9$77sE84No',
        '9Lad&m7P7ZdP*s6x'
      ),
    }),
  })(
    'given random data when the data is valid then it passes',
    async (data) => {
      const errors = await validator.validate(plainToClass(SignUp, data));

      expect(errors).toHaveLength(0);
    }
  );
});
