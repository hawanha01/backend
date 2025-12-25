import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueue } from './email.queue';
import { EmailProcessor } from './email.processor';
import { EmailModule } from '../../../third-party/email/email.module';
import { defaultQueueOptions } from '../../config/queue.config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
      ...defaultQueueOptions,
    }),
    EmailModule,
  ],
  providers: [EmailQueue, EmailProcessor],
  exports: [EmailQueue],
})
export class EmailQueueModule {}
