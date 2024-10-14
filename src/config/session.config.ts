import { webcrypto } from 'node:crypto';

import { registerAs } from '@nestjs/config';
import * as connectPgSimple from 'connect-pg-simple';
import * as session from 'express-session';

async function generateSessionSecret(): Promise<string> {
  const key = await webcrypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  const jwk = await webcrypto.subtle.exportKey('jwk', key);

  return jwk.k;
}

export default registerAs(
  'session',
  async (): Promise<session.SessionOptions> => {
    const { SESSION_SECRET: secret = await generateSessionSecret() } =
      process.env;
    const resave = false;
    const saveUninitialized = false;
    const cookie: session.CookieOptions = {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
    };
    let store: session.Store = new session.MemoryStore();

    if (process.env.NODE_ENV === 'production') {
      const Store = connectPgSimple(session);

      cookie.secure = true;
      store = new Store({
        conString: process.env.DATABASE_URL,
      });
    }

    return {
      secret,
      resave,
      saveUninitialized,
      store,
      cookie,
    };
  },
);
