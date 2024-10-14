import { type NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setup } from './setup';

async function bootstrap(options?: NestApplicationOptions) {
  const app = await NestFactory.create(AppModule, options);

  setup(app);

  await app.listen(process.env.PORT || 3000);
}

void bootstrap();
