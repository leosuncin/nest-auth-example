import { JwtService } from '@nestjs/jwt';
import { type Mocked, mock } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import type { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { AuthService } from './auth.service';
import type { SignUp } from './dto/sign-up.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

describe('AuthService', () => {
  let service: AuthService;
  let mockedUserService: Mocked<UserService>;
  let mockedJwtService: Mocked<JwtService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService).compile();

    service = unit;
    mockedUserService = unitRef.get(UserService);
    mockedJwtService = unitRef.get(JwtService);
  });

  it('should be an instanceof AuthService', () => {
    expect(service).toBeInstanceOf(AuthService);
  });

  it('should register a new user', async () => {
    const signUp: SignUp = {
      name: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
    };

    mockedUserService.create.mockResolvedValueOnce(signUp as User);
    const user = await service.register(signUp);

    expect(user).toHaveProperty('email', signUp.email);
    expect(user).toHaveProperty('name', signUp.name);
  });

  it('should log in an existing user', async () => {
    const email = 'john@doe.me';
    const password = 'Pa$$w0rd';
    const userMocked = mock<User>({ email });

    userMocked.checkPassword.mockResolvedValueOnce(true);
    mockedUserService.findOne.mockResolvedValueOnce(userMocked);
    const user = await service.login(email, password);

    expect(user).toHaveProperty('email', email);
  });

  it('should throw on log in when the email not exist', async () => {
    const email = 'notfound@example.com';
    /* spell-checker:dictionaries lorem-ipsum */
    const password = 'laboris-tempor-amet';

    mockedUserService.findOne.mockRejectedValueOnce('NotFound');

    await expect(service.login(email, password)).rejects.toThrow(
      "There isn't any user with email: notfound@example.com"
    );
  });

  it('should throw on log in when the email not exist', async () => {
    const email = 'john@doe.me';
    /* spell-checker:dictionaries lorem-ipsum */
    const password = 'Exercitation esse labore anim';
    const userMocked = mock<User>({ email });

    mockedUserService.findOne.mockResolvedValueOnce(userMocked);

    await expect(service.login(email, password)).rejects.toThrow(
      'Wrong password for user with email: john@doe.me'
    );
  });

  it('should verify the JWT payload', async () => {
    const payload: JwtPayload = {
      sub: 'john@doe.me',
      iat: 0,
      exp: 0,
    };
    const userMocked = mock<User>({ email: payload.sub });

    mockedUserService.findOne.mockResolvedValueOnce(userMocked);
    const user = await service.verifyPayload(payload);

    expect(user).toHaveProperty('email', payload.sub);
  });

  it("should throw on verify when JWT's subject not exist", async () => {
    const payload: JwtPayload = {
      sub: 'notregistered@example.com',
      iat: 0,
      exp: 0,
    };

    mockedUserService.findOne.mockRejectedValueOnce('NotFound');

    await expect(service.verifyPayload(payload)).rejects.toThrow(
      "There isn't any user with email: notregistered@example.com"
    );
  });

  it('should sign a new JWT', () => {
    const user = { email: 'john@doe.me' } as User;

    mockedJwtService.sign.mockReturnValueOnce('j.w.t');
    const token = service.signToken(user);

    expect(token).toEqual(expect.any(String));
  });
});
