import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';
import { setSeederFactory } from 'typeorm-extension';

import { User } from '../entities/user.entity';

export const UserFactory = FactoryBuilder.of(User)
  .props({
    name: () => faker.person.fullName(),
    email: () => faker.internet.exampleEmail(),
    password: () => faker.internet.password({ memorable: true }),
  })
  .build();

export const userFactory = setSeederFactory(
  User,
  (faker) =>
    new User({
      email: faker.internet.exampleEmail(),
      name: faker.person.fullName(),
      password: 'Pa$$w0rd',
    })
);
