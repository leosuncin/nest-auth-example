import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { EMAIL_QUEUE_NAME } from './mail.constant';
import { MailConsumer } from './mail.consumer';

@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE_NAME })],
  providers: [MailConsumer],
})
export class MailModule {}
