import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import bullMQService from '../services/bullmq';
import logger from '../utils/logger';
import { ScheduleRequest, ScheduleResponse, JobData } from '../types';

// In-memory job storage (in production, use a proper database)
const scheduledJobs: Map<string, JobData> = new Map();

/**
 * POST /api/schedule - Schedule a price history job
 */
export const scheduleJob = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { token, network, interval = '0 0 * * *', enabled = true }: ScheduleRequest = req.body;

    logger.info(`Schedule request for ${token} on ${network} with interval ${interval}`);

    // Check if job already exists
    const existingJobId = findExistingJob(token, network);
    if (existingJobId) {
      res.status(409).json({
        error: 'Job already exists',
        message: `A job for ${token} on ${network} already exists`,
        existingJobId
      });
      return;
    }

    // Create new job
    const jobId = uuidv4();
    const now = new Date().toISOString();
    
    const jobData: JobData = {
      id: jobId,
      token,
      network,
      interval,
      enabled,
      createdAt: now,
      lastRun: undefined,
      nextRun: getNextRunTime(interval)
    };

    // Store job data
    scheduledJobs.set(jobId, jobData);

    // Schedule the job in BullMQ
    if (enabled) {
      const queueResult = await bullMQService.addPriceHistoryJob({
        token: token.toUpperCase(),
        network: network.toLowerCase(),
        requestId: jobId
      });

      if (queueResult) {
        logger.info(`BullMQ job scheduled for ${token} on ${network}`);
      } else {
        logger.warn('Failed to queue job in BullMQ, but job still scheduled');
      }
    }

    const response: ScheduleResponse = {
      success: true,
      message: `Job scheduled successfully for ${token} on ${network}`,
      jobId,
      estimatedTime: 5000,
      scheduledAt: now
    };

    logger.info(`Job scheduled successfully: ${jobId}`);
    res.json(response);

  } catch (error) {
    logger.error('Error in scheduleJob:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to schedule job'
    });
  }
};

/**
 * GET /api/schedule - Get all scheduled jobs
 */
export const getScheduledJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = Array.from(scheduledJobs.values());
    
    res.json({
      jobs,
      total: jobs.length,
      active: jobs.filter(job => job.enabled).length
    });
  } catch (error) {
    logger.error('Error in getScheduledJobs:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch scheduled jobs'
    });
  }
};

/**
 * GET /api/schedule/:jobId - Get specific job details
 */
export const getJobDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    
    const job = scheduledJobs.get(jobId);
    if (!job) {
      res.status(404).json({
        error: 'Job not found',
        message: `No job found with ID: ${jobId}`
      });
      return;
    }

    // Try to get BullMQ job status
    const queueStatus = await bullMQService.getJobStatus(jobId);

    res.json({
      ...job,
      queueStatus: queueStatus || 'Not available'
    });
  } catch (error) {
    logger.error('Error in getJobDetails:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch job details'
    });
  }
};

/**
 * PUT /api/schedule/:jobId - Update job (enable/disable)
 */
export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { jobId } = req.params;
    const { enabled } = req.body;

    const job = scheduledJobs.get(jobId);
    if (!job) {
      res.status(404).json({
        error: 'Job not found',
        message: `No job found with ID: ${jobId}`
      });
      return;
    }

    // Update job
    job.enabled = enabled;
    job.lastRun = new Date().toISOString();
    scheduledJobs.set(jobId, job);

    // If enabling, add to BullMQ queue
    if (enabled) {
      await bullMQService.addPriceHistoryJob({
        token: job.token.toUpperCase(),
        network: job.network.toLowerCase(),
        requestId: jobId
      });
    }

    logger.info(`Job ${jobId} updated: enabled=${enabled}`);

    res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    logger.error('Error in updateJob:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update job'
    });
  }
};

/**
 * DELETE /api/schedule/:jobId - Delete job
 */
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = scheduledJobs.get(jobId);
    if (!job) {
      res.status(404).json({
        error: 'Job not found',
        message: `No job found with ID: ${jobId}`
      });
      return;
    }

    // Remove from storage
    scheduledJobs.delete(jobId);

    logger.info(`Job ${jobId} deleted`);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteJob:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete job'
    });
  }
};

/**
 * POST /api/schedule/:jobId/run - Run job manually
 */
export const runJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = scheduledJobs.get(jobId);
    if (!job) {
      res.status(404).json({
        error: 'Job not found',
        message: `No job found with ID: ${jobId}`
      });
      return;
    }

    if (!job.enabled) {
      res.status(400).json({
        error: 'Job is disabled',
        message: 'Cannot run a disabled job'
      });
      return;
    }

    // Add job to BullMQ queue for immediate execution
    const queueResult = await bullMQService.addPriceHistoryJob({
      token: job.token.toUpperCase(),
      network: job.network.toLowerCase(),
      requestId: `manual-${jobId}-${Date.now()}`
    });

    if (queueResult) {
      // Update last run time
      job.lastRun = new Date().toISOString();
      scheduledJobs.set(jobId, job);

      logger.info(`Job ${jobId} executed manually`);

      res.json({
        success: true,
        message: 'Job started successfully',
        queueJobId: queueResult.jobId,
        status: queueResult.status
      });
    } else {
      res.status(500).json({
        error: 'Failed to queue job',
        message: 'Job scheduling system is not available'
      });
    }
  } catch (error) {
    logger.error('Error in runJob:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to run job'
    });
  }
};

/**
 * Helper function to find existing job by token and network
 */
function findExistingJob(token: string, network: string): string | null {
  for (const [jobId, job] of Array.from(scheduledJobs.entries())) {
    if (job.token.toLowerCase() === token.toLowerCase() && 
        job.network.toLowerCase() === network.toLowerCase()) {
      return jobId;
    }
  }
  return null;
}

/**
 * Helper function to calculate next run time
 * In a real implementation, this would parse the cron expression
 */
function getNextRunTime(interval: string): string {
  // For demo purposes, calculate next run as 5 minutes from now
  const nextRun = new Date(Date.now() + 5 * 60 * 1000);
  return nextRun.toISOString();
}

const scheduleController = {
  scheduleJob,
  getScheduledJobs,
  getJobDetails,
  updateJob,
  deleteJob,
  runJob
};

export default scheduleController;
