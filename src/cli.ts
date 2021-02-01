import '@suncin/dotenv';
import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { CliModule } from './cli/cli.module';

(async () => {
  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: ['error'],
  });
  app.select(CommandModule).get(CommandService).exec();
})();
