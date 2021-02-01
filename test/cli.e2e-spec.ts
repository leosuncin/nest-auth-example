import 'console-testing-library'

import { Test } from '@nestjs/testing';
import { CommandModule, CommandModuleTest } from 'nestjs-command';
import * as faker from 'faker';

import { CliModule } from '../src/cli/cli.module';

describe('CLI E2E', () => {
  let command: CommandModuleTest;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [CliModule]
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    command = new CommandModuleTest(app.select(CommandModule));
  });

  it('should create the token', async () => {
    const args = { email: faker.internet.exampleEmail() };
    const exitCode = 0;

    await command.execute('create:token <email>', args, exitCode);
  });
});
