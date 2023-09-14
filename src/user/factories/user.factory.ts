import { setSeederFactory } from 'typeorm-extension';

import { User } from '../entities/user.entity';

export const userFactory = setSeederFactory(User, faker => {
  const user = new User();
  user.name = faker.person.fullName();
  user.email = faker.internet.email();
  user.password = 'Pa$$w0rd';

  return user;
});
