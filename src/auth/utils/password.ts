import { ok } from 'node:assert/strict';
import {
  type Argon2Algorithm,
  type Argon2Parameters,
  argon2,
  getRandomValues,
  timingSafeEqual,
} from 'node:crypto';

import { Inject, type InjectionToken } from '@nestjs/common';

function assertArgon2Algorithm(
  variant: string
): asserts variant is Argon2Algorithm {
  const algorithms = new Set<Argon2Algorithm>([
    'argon2d',
    'argon2i',
    'argon2id',
  ]);

  // @ts-expect-error To be or not an Argon2 algorithm
  ok(algorithms.has(variant), 'Invalid Argon2 variant');
}

export const HASH_PASSWORD: InjectionToken<
  (password: string) => Promise<string>
> = Symbol.for('hash password');

export const InjectHasher = () => Inject(HASH_PASSWORD);

export function hashPassword(password: string): Promise<string> {
  const algorithm: Argon2Algorithm = 'argon2id';
  const nonce = getRandomValues(new Uint8Array(32));
  const parameters: Argon2Parameters = {
    message: password,
    nonce,
    parallelism: 4,
    tagLength: 32,
    memory: 2 ** 16,
    passes: 4,
  };

  return new Promise((resolve, reject) => {
    argon2(algorithm, parameters, (error, derivedKey) => {
      if (error) {
        reject(error);
      } else {
        resolve(
          `$${algorithm}$v=19$m=${parameters.memory},t=${parameters.passes},p=${parameters.parallelism}$${Buffer.from(nonce).toString('base64url')}$${derivedKey.toString('base64url')}`
        );
      }
    });
  });
}

export const VERIFY_PASSWORD: InjectionToken<
  (password: string, hash: string) => Promise<boolean>
> = Symbol.for('verify password');

export const InjectVerifier = () => Inject(VERIFY_PASSWORD);

export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const { resolve, reject, promise } = Promise.withResolvers<boolean>();
  const parts = hash.split('$');

  try {
    ok(parts.length === 6, 'Invalid hash format');

    const [, variant, , paramStr, saltB64, hashB64] = parts;

    assertArgon2Algorithm(variant);

    const params = Object.fromEntries(
      paramStr.split(',').map((p) => {
        const [k, v] = p.split('=');
        return [k, Number.parseInt(v, 10)];
      })
    );
    const nonce = Buffer.from(saltB64, 'base64url');
    const originalHash = Buffer.from(hashB64, 'base64url');
    const parameters: Argon2Parameters = {
      message: password,
      nonce,
      parallelism: params.p,
      tagLength: originalHash.length,
      memory: params.m,
      passes: params.t,
    };

    argon2(variant, parameters, (error, derivedKey) => {
      if (error) {
        reject(error);
      } else {
        resolve(timingSafeEqual(derivedKey, originalHash));
      }
    });
  } catch (error) {
    reject(error);
  }

  return promise;
}
