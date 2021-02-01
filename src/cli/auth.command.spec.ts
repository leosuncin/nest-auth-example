import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { getLog } from 'console-testing-library';

import { AuthCommand } from './auth.command';

describe('Auth Command', () => {
  let command: AuthCommand
  const jwtServiceMock = mock<JwtService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCommand,
        { provide: JwtService, useValue: jwtServiceMock },
      ]
    }).compile()

    command = module.get(AuthCommand)
  })

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should create the token', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6ICJKV1QifQ==.eyJzdWIiOiIiLCJpYXQiOjB9.VTMyVDRINm4='

    jwtServiceMock.sign.mockReturnValueOnce(token)
    command.createToken('email@example.org')

    expect(getLog().log).toMatch(token)
  })

  it('should validate the email', () => {
    const processExitMock = jest.spyOn(process, 'exit').mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      // @ts-expect-error  Unreachable code
      () => {
        void 0
      }
    );

    command.createToken('not_an_email')

    expect(getLog().stderr).toBe('not_an_email is not valid')
    expect(processExitMock).toHaveBeenCalledWith(1)
  })
})
