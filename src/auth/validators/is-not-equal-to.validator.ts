import { timingSafeEqual } from 'node:crypto';
import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export function IsNotEqualTo<Type extends Record<string, unknown>>(
  property: keyof Type,
  options: ValidationOptions = {}
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      constraints: [property],
      options,
      propertyName,
      target: object.constructor,
      name: 'isNotEqualTo',
      validator: {
        validate(value: unknown, validationArguments: ValidationArguments) {
          const [property] = validationArguments.constraints as [string];
          const object = validationArguments.object as Record<string, string>;

          if (
            typeof value !== 'string' ||
            !value ||
            typeof value !== typeof object[property]
          ) {
            return true;
          }

          if (value.length !== object[property]?.length) {
            return true;
          }

          const encoder = new TextEncoder();

          return !timingSafeEqual(
            encoder.encode(String(object[property])),
            encoder.encode(String(value))
          );
        },
        defaultMessage({ constraints }: ValidationArguments) {
          const [property] = constraints as [string];

          return `$property must be different than ${property}`;
        },
      },
    });
  };
}
