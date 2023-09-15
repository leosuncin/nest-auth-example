import { setSeederFactory } from 'typeorm-extension';

import { Profile } from '../entities/profile.entity';

export const profileFactory = setSeederFactory(Profile, faker => {
  const profile = new Profile();
  profile.birthday = faker.date.birthdate();
  profile.occupation = faker.person.jobTitle();
  profile.phone = faker.phone.number();
  profile.website = faker.internet.url();

  return profile;
});
