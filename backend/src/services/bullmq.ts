import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { processPriceHistoryJob } from '../workers/priceHistoryWorker';
import logger from '../utils/logger';

// Job data interface
export interface PriceHistoryJobData {
  token: string;
  network: string;
  startDate?: string;
  endDate?: string;
  requestId?: string;
}

// Job result interface
export interface PriceHistoryJobResult {
  token: string;
  network: string;
  pricesProcessed: number;
  timeRange: {
    start: string;
    end: string;
  };
  duration: number;
  errors: string[];
}

class BullMQService {
  private redis: Redis | null = null;
  private queue: Queue<PriceHistoryJobData, PriceHistoryJobResult> | null = null;
  private worker: Worker<PriceHistoryJobData, PriceHistoryJobResult> | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = !!process.env.BULLMQ_REDIS_URL;
    
    if (this.isEnabled) {
      this.initializeRedis();
      this.initializeQueue();
      
      // Start the worker automatically
      this.startWorker(processPriceHistoryJob);
    } else {
      logger.info('BullMQ is disabled (no Redis URL provided)');
    }
  }

  private initializeRedis(): void {
    try {
      this.redis = new Redis(process.env.BULLMQ_REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        lazyConnect: true
      });

      this.redis.on('connect', () => {
        logger.info('BullMQ Redis connected');
      });

      this.redis.on('error', (error) => {
        logger.error('BullMQ Redis error:', error);
      });

      this.redis.on('close', () => {
        logger.warn('BullMQ Redis connection closed');
      });
    } catch (error) {
      logger.error('Failed to initialize BullMQ Redis:', error);
      this.isEnabled = false;
    }
  }

  private initializeQueue(): void {
    if (!this.redis) {
      logger.error('Cannot initialize queue without Redis connection');
      return;
    }

    try {
      const queueName = process.env.BULLMQ_QUEUE_NAME || 'price-history';
      
      this.queue = new Queue<PriceHistoryJobData, PriceHistoryJobResult>(queueName, {
        connection: this.redis,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        }
      });

      logger.info(`BullMQ queue '${queueName}' initialized`);
    } catch (error) {
      logger.error('Failed to initialize BullMQ queue:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Add a price history job to the queue
   */
  async addPriceHistoryJob(
    jobData: PriceHistoryJobData,
    options?: {
      priority?: number;
      delay?: number;
      jobId?: string;
    }
  ): Promise<{ jobId: string; status: 'queued' } | null> {
    if (!this.isEnabled || !this.queue) {
      logger.warn('BullMQ not available, cannot add job');
      return null;
    }

    try {
      const job = await this.queue.add('fetch-price-history', jobData, {
        priority: options?.priority || 0,
        delay: options?.delay || 0,
        jobId: options?.jobId || undefined
      });

      logger.info(`Price history job added to queue: ${job.id} for ${jobData.token} on ${jobData.network}`);
      
      return {
        jobId: job.id || 'unknown',
        status: 'queued'
      };
    } catch (error) {
      logger.error('Failed to add price history job:', error);
      return null;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<{
    id: string;
    status: string;
    progress?: number;
    result?: PriceHistoryJobResult;
    error?: string;
  } | null> {
    if (!this.isEnabled || !this.queue) {
      return null;
    }

    try {
      const job = await Job.fromId(this.queue, jobId);
      
      if (!job) {
        return null;
      }

      const status = await job.getState();
      
      return {
        id: job.id || 'unknown',
        status: status,
        progress: typeof job.progress === 'number' ? job.progress : undefined,
        result: job.returnvalue,
        error: job.failedReason
      };
    } catch (error) {
      logger.error('Failed to get job status:', error);
      return null;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  } | null> {
    if (!this.isEnabled || !this.queue) {
      return null;
    }

    try {
      const counts = await this.queue.getJobCounts();
      return {
        waiting: counts.waiting || 0,
        active: counts.active || 0,
        completed: counts.completed || 0,
        failed: counts.failed || 0,
        delayed: counts.delayed || 0
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      return null;
    }
  }

  /**
   * Start the worker (this will be called from a separate worker process)
   */
  startWorker(processorFunction: (job: Job<PriceHistoryJobData, PriceHistoryJobResult>) => Promise<PriceHistoryJobResult>): void {
    if (!this.isEnabled || !this.redis) {
      logger.warn('Cannot start worker: BullMQ not available');
      return;
    }

    const queueName = process.env.BULLMQ_QUEUE_NAME || 'price-history';
    
    this.worker = new Worker<PriceHistoryJobData, PriceHistoryJobResult>(
      queueName,
      processorFunction,
      {
        connection: this.redis,
        concurrency: 5
      }
    );

    this.worker.on('completed', (job, result) => {
      logger.info(`Job completed: ${job.id} - Processed ${result.pricesProcessed} prices`);
    });

    this.worker.on('failed', (job, error) => {
      logger.error(`Job failed: ${job?.id} - ${error.message}`);
    });

    this.worker.on('error', (error) => {
      logger.error('Worker error:', error);
    });

    logger.info(`BullMQ worker started for queue: ${queueName}`);
  }

  /**
   * Gracefully shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.worker) {
        await this.worker.close();
        logger.info('BullMQ worker closed');
      }

      if (this.queue) {
        await this.queue.close();
        logger.info('BullMQ queue closed');
      }

      if (this.redis) {
        this.redis.disconnect();
        logger.info('BullMQ Redis disconnected');
      }
    } catch (error) {
      logger.error('Error during BullMQ shutdown:', error);
    }
  }

  isReady(): boolean {
    return this.isEnabled && !!this.queue;
  }
}

const bullMQService = new BullMQService();
export default bullMQService;
