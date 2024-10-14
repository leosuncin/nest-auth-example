import { HttpStatus, type ValidationPipeOptions } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'validation',
  (): ValidationPipeOptions => ({
    transform: true,
    whitelist: true,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  }),
);
