import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { Traceable } from 'nestjs-otel';
import { type FindOptionsWhere, Not, type Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@Traceable()
@ValidatorConstraint({ name: 'isRegistered', async: true })
@Injectable()
export class IsRegisteredConstraint implements ValidatorConstraintInterface {
  @InjectRepository(User)
  private readonly userRepository!: Repository<User>;

  async validate(value: unknown, args: ValidationArguments) {
    if (typeof value !== 'string' || !value) {
      return true;
    }

    const property = args.property as 'email' | (string & {});
    const dto = args.object as { id?: User['id']; [property]: unknown };

    if (property !== 'email') {
      return true;
    }

    const where: FindOptionsWhere<User> = {
      email: value,
    };

    if (dto.id) {
      where.id = Not(dto.id);
    }

    const count = await this.userRepository.countBy(where);

    return count === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object;
    return 'id' in dto && dto.id
      ? '$property «$value» is already taken'
      : '$property «$value» is already registered';
  }
}

export function IsRegistered<T extends { id?: User['id']; email: string }>(
  options: ValidationOptions = {}
) {
  return (object: T, propertyName: 'email') => {
    registerDecorator({
      options,
      propertyName,
      target: object.constructor,
      validator: IsRegisteredConstraint,
    });
  };
}
