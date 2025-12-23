import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueModule } from './queues/email/email-queue.module';
import { getRedisConnection } from './config/queue.config';

@Module({
  imports: [
    BullModule.forRoot({
      connection: getRedisConnection(),
    }),
    EmailQueueModule,
  ],
  exports: [EmailQueueModule],
})
export class QueueModule {}
