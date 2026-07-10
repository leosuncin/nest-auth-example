/// <reference types="vitest/globals" />
import { hashPassword, verifyPassword } from './password';

test('given hashPassword is executed when a plain password is passed then it hashes the password', async () => {
  const password = 'my-test-password';
  const hash = await hashPassword(password);

  expect(hash).toBeDefined();
  expect(hash).not.toEqual(password);
});

test('given verifyPassword is executed when a password and its hash are passed then it returns true', async () => {
  const password = 'my-test-password';
  const hash = await hashPassword(password);
  const isValid = await verifyPassword(password, hash);

  expect(isValid).toBe(true);
});

test('given verifyPassword is executed when a password and its hash are passed then it returns false for an incorrect password', async () => {
  const password = 'my-test-password';
  const hash = await hashPassword(password);
  const isValid = await verifyPassword('wrong-password', hash);

  expect(isValid).toBe(false);
});
