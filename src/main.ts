import { NestFactory } from '@nestjs/core';
import { Logger } from 'pino-nestjs';

import { AppModule } from './app.module';
import { sdk } from './instrumentation';
import { setup } from './setup';

async function bootstrap() {
  const port = Number.parseInt(process.env.PORT as string, 10) || 3000;
  const production = process.env.NODE_ENV === 'production';

  sdk.start();

  const app = await NestFactory.create(AppModule, { bufferLogs: production });

  setup(app);

  if (production) {
    app.useLogger(app.get(Logger));
  }

  await app.listen(port);
}

bootstrap();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.debug('Tracing terminated'))
    .catch((error: unknown) =>
      console.error('Error terminating tracing', error)
    )
    .finally(() => process.exit(0));
});
