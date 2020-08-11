import { ValidationPipe, HttpStatus, INestApplication } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as connectPgSimple from 'connect-pg-simple';

import { AppModule } from './app.module';

export function setup(app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  app.use(cookieParser(process.env.APP_SECRET));

  app.use(
    session({
      secret: process.env.APP_SECRET as string,
      resave: false,
      saveUninitialized: false,
      store:
        process.env.NODE_ENV === 'production'
          ? new (connectPgSimple(session))()
          : new session.MemoryStore(),
      cookie: {
        httpOnly: true,
        signed: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(/\s*,\s*/) ?? '*',
    credentials: true,
    exposedHeaders: ['Authorization'],
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}
