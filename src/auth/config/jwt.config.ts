import { webcrypto } from 'node:crypto';

import { registerAs } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

async function generateJwtKey(): Promise<string> {
  const key = await webcrypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-384' },
    true,
    ['sign', 'verify'],
  );
  const jwk = await webcrypto.subtle.exportKey('jwk', key);

  return jwk.k;
}

export default registerAs(
  'jwt',
  async (): Promise<JwtModuleOptions> => ({
    secret: process.env.JWT_SECRET ?? (await generateJwtKey()),
    signOptions: {
      expiresIn: '1d',
      algorithm: 'HS384',
    },
    verifyOptions: {
      algorithms: ['HS384'],
      ignoreExpiration: false,
    },
  }),
);
