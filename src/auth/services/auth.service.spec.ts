import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type Mocked, stub } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import { EntityNotFoundError, type Repository } from 'typeorm';
import type { Mock } from 'vitest';
import type { SignUp } from '../dto/sign-up.dto';
import type { UserUpdate } from '../dto/user-update.dto';
import { User } from '..//entities/user.entity';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { VERIFY_PASSWORD, type verifyPassword } from '../utils/password';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let repository: Mocked<Repository<User>>;
  let jwt: Mocked<JwtService>;
  let verify: Mock<typeof verifyPassword>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService)
      .mock(VERIFY_PASSWORD as symbol)
      .impl(stub)
      .compile();

    service = unit;
    repository = unitRef.get(
      getRepositoryToken(User) as string
    ) as unknown as Mocked<Repository<User>>;
    jwt = unitRef.get(JwtService) as unknown as Mocked<JwtService>;
    verify = unitRef.get(VERIFY_PASSWORD as symbol) as unknown as Mock<
      typeof verifyPassword
    >;
  });

  it('given the register is called when the sign-up data is passed then it creates a user', async () => {
    const signUp: SignUp = {
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    };

    repository.create.mockReturnValue(new User(signUp));
    repository.save.mockResolvedValue(new User(signUp));

    const user = await service.register(signUp);

    expect(user).toHaveProperty('email', signUp.email);
    expect(user).toHaveProperty('name', signUp.name);
  });

  it('given the login is called when the credentials are passed then it returns the user', async () => {
    const email = 'john@doe.me';
    const password = 'Pa$$w0rd';
    const userMocked = new User({ email });

    verify.mockResolvedValueOnce(true);
    repository.findOneOrFail.mockResolvedValueOnce(userMocked);
    const user = await service.login(email, password);

    expect(user).toHaveProperty('email', email);
  });

  it('given the login is called when a non-existing email is passed then it throws a not found error', async () => {
    const email = 'notfound@example.com';
    /* spell-checker:dictionaries lorem-ipsum */
    const password = 'laboris-tempor-amet';

    repository.findOneOrFail.mockRejectedValueOnce(
      new EntityNotFoundError(User, {})
    );

    await expect(service.login(email, password)).rejects.toThrow(
      "There isn't any user with email: notfound@example.com"
    );
  });

  it('given the login is called when a wrong password is passed then it throws a wrong password error', async () => {
    const email = 'john@doe.me';
    /* spell-checker:dictionaries lorem-ipsum */
    const password = 'Exercitation esse labore anim';
    const userMocked = new User({ email });

    repository.findOneOrFail.mockResolvedValueOnce(userMocked);
    verify.mockResolvedValue(false);

    await expect(service.login(email, password)).rejects.toThrow(
      'Wrong password for user with email: john@doe.me'
    );
  });

  it('given the updateUser is called when the user changes are passed then it saves and returns the updated user', async () => {
    const user = new User({ id: 'a4a1240a-dbfd-403a-91d8-509603491065' });
    const changes: UserUpdate = {
      id: 'a4a1240a-dbfd-403a-91d8-509603491065',
      email: 'john.doe@example.me',
      name: 'John Doe',
      password: 'Pa$$w0rd',
    };

    repository.merge.mockImplementation(Object.assign);
    repository.save.mockResolvedValue(new User(changes));

    const changed = await service.updateUser(user, changes);

    expect(changed).toBeDefined();
    expect(repository.merge).toHaveBeenCalledWith(user, changes);
    expect(repository.save).toHaveBeenCalledAfter(repository.merge);
  });

  it('given the verifyPayload is called when a JWT payload is passed then it returns the user', async () => {
    const payload: JwtPayload = {
      sub: 'john@doe.me',
      iat: 0,
      exp: 0,
    };
    const userMocked = new User({ email: payload.sub });

    repository.findOneOrFail.mockResolvedValueOnce(userMocked);
    const user = await service.verifyPayload(payload);

    expect(user).toHaveProperty('email', payload.sub);
  });

  it('given the verifyPayload is called when a JWT payload with an unknown email is passed then it throws', async () => {
    const payload: JwtPayload = {
      sub: 'notregistered@example.com',
      iat: 0,
      exp: 0,
    };

    repository.findOneOrFail.mockRejectedValueOnce(
      new EntityNotFoundError(User, { where: { email: payload.sub } })
    );

    await expect(service.verifyPayload(payload)).rejects.toThrow(
      EntityNotFoundError
    );
  });

  it('given the signToken is called when the user is passed then it returns a JWT', () => {
    const user = { email: 'john@doe.me' } as User;

    jwt.sign.mockReturnValueOnce('j.w.t');
    const token = service.signToken(user);

    expect(token).toEqual(expect.any(String));
  });
});
