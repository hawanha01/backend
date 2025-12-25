import { config } from '../../../config/env';
import { QueueOptions } from 'bullmq';

export const getRedisConnection = (): QueueOptions['connection'] => {
  return {
    host: config.redis.host,
    port: config.redis.port,
  };
};

export const defaultQueueOptions: QueueOptions = {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
};
