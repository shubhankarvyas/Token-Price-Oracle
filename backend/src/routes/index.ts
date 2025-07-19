import express from 'express';
import { getPrice, getPriceHistory, getSupportedNetworks } from './price';
import { 
  scheduleJob, 
  getScheduledJobs, 
  getJobDetails, 
  updateJob, 
  deleteJob, 
  runJob 
} from './schedule';
import { 
  validatePriceRequest, 
  validatePriceQueryRequest,
  validateScheduleRequest, 
  validatePriceHistoryRequest, 
  validateJobId, 
  validateJobUpdateRequest 
} from '../middleware/validation';
import { priceCacheMiddleware, setCacheMiddleware } from '../middleware/cache';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const priceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 price requests per minute
  message: 'Too many price requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
router.use(generalLimiter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Price endpoints
router.get('/price', 
  priceLimiter,
  validatePriceQueryRequest,
  priceCacheMiddleware,
  setCacheMiddleware(),
  getPrice
);

router.post('/price', 
  priceLimiter,
  validatePriceRequest,
  priceCacheMiddleware,
  setCacheMiddleware(),
  getPrice
);

router.get('/price/history',
  priceLimiter,
  validatePriceHistoryRequest,
  getPriceHistory
);

router.get('/price/supported-networks',
  getSupportedNetworks
);

// Schedule endpoints
router.post('/schedule',
  validateScheduleRequest,
  scheduleJob
);

router.get('/schedule',
  getScheduledJobs
);

router.get('/schedule/:jobId',
  validateJobId,
  getJobDetails
);

router.put('/schedule/:jobId',
  validateJobId,
  validateJobUpdateRequest,
  updateJob
);

router.delete('/schedule/:jobId',
  validateJobId,
  deleteJob
);

router.post('/schedule/:jobId/run',
  validateJobId,
  runJob
);

export default router;
