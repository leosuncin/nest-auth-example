import { ValidationPipe, INestApplication } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';

import { AppModule } from './app.module';
import cookieConfig from './config/cookie.config';
import corsConfig from './config/cors.config';
import sessionConfig from './config/session.config';
import validationConfig from './config/validation.config';

export function setup(app: INestApplication): INestApplication {
  app.useGlobalPipes(new ValidationPipe(app.get(validationConfig.KEY)));

  app.use(cookieParser(app.get(cookieConfig.KEY).secret));

  app.use(session(app.get(sessionConfig.KEY)));

  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors(app.get(corsConfig.KEY));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}
