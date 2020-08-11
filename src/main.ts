import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setup } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setup(app)

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
