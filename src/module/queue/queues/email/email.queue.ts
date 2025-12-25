import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface StoreOwnerWelcomeEmailJobData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  verificationLink: string;
}

@Injectable()
export class EmailQueue {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  /**
   * Add store owner welcome email job to queue
   */
  async addStoreOwnerWelcomeEmail(
    data: StoreOwnerWelcomeEmailJobData,
  ): Promise<void> {
    await this.emailQueue.add('store-owner-welcome', data, {
      priority: 1, // High priority for welcome emails
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
