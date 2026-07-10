import { faker } from '@faker-js/faker';
import { FactoryBuilder } from 'factory.io';

import { SignUp } from '../dto/sign-up.dto';

export const signUpFactory = FactoryBuilder.of(SignUp)
  .props({
    email: () => faker.internet.exampleEmail(),
    name: () => faker.person.fullName(),
    password: () => faker.internet.password({ memorable: true }),
  })
  .build();
