import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from '../../../third-party/email/services/email.service';
import { StoreOwnerWelcomeEmailJobData } from './email.queue';

@Processor('email', {
  concurrency: 5, // Process 5 emails concurrently
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<StoreOwnerWelcomeEmailJobData>): Promise<void> {
    const { name, data } = job;

    this.logger.log(
      `Processing email job: ${name} for ${data.email} (Job ID: ${job.id})`,
    );

    try {
      switch (name) {
        case 'store-owner-welcome':
          await this.processStoreOwnerWelcomeEmail(data);
          break;
        default:
          this.logger.warn(`Unknown email job type: ${name}`);
          throw new Error(`Unknown email job type: ${name}`);
      }

      this.logger.log(
        `Email job completed successfully: ${name} for ${data.email} (Job ID: ${job.id})`,
      );
    } catch (error) {
      this.logger.error(
        `Email job failed: ${name} for ${data.email} (Job ID: ${job.id})`,
        error,
      );
      throw error; // Re-throw to mark job as failed
    }
  }

  private async processStoreOwnerWelcomeEmail(
    data: StoreOwnerWelcomeEmailJobData,
  ): Promise<void> {
    await this.emailService.sendStoreOwnerWelcomeEmail(data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Email job completed: ${job.name} (Job ID: ${job.id})`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Email job failed: ${job.name} (Job ID: ${job.id})`,
      error.stack,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Email job stalled: ${jobId}`);
  }
}
