import { Injectable } from '@nestjs/common';
import { Traceable } from 'nestjs-otel';
import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
  type UpdateEvent,
} from 'typeorm';

import { User } from '../entities/user.entity';
import { hashPassword } from '../utils/password';

@Traceable()
@EventSubscriber()
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    const password = await hashPassword(event.entity.password);

    event.entity.password = password;
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    const changePassword = event.updatedColumns.some(
      (column) => column.propertyName === 'password'
    );

    if (changePassword && event.entity) {
      const password = await hashPassword(event.entity.password);
      event.entity.password = password;
    }
  }
}
