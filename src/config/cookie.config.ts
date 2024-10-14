import { webcrypto } from 'node:crypto';

import { registerAs } from '@nestjs/config';

async function generateCookieSecret(): Promise<string> {
  const key = await webcrypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  const jwk = await webcrypto.subtle.exportKey('jwk', key);

  return jwk.k;
}

export default registerAs(
  'cookie',
  async (): Promise<{ secret: string }> => ({
    secret: process.env.COOKIE_SECRET ?? (await generateCookieSecret()),
  }),
);
