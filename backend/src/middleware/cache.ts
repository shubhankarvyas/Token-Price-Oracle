import { Request, Response, NextFunction } from 'express';
import redisService from '../services/redis';
import logger from '../utils/logger';
import { CacheData } from '../types';

/**
 * Redis caching middleware for Express
 * Checks Redis cache for existing data and sets up cache key for storing new data
 */
export const cacheMiddleware = (keyGenerator?: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Generate cache key
      const cacheKey = keyGenerator ? keyGenerator(req) : generateDefaultCacheKey(req);
      
      // Attach cache key to request for later use
      (req as any).redisKey = cacheKey;

      // Check if data exists in cache
      const cachedData = await redisService.get(cacheKey);
      
      if (cachedData) {
        try {
          const parsedData: CacheData = JSON.parse(cachedData);
          
          logger.info(`Cache hit for key: ${cacheKey}`);
          
          // Return cached data
          res.json({
            ...parsedData,
            source: 'cache'
          });
          return;
        } catch (parseError) {
          logger.error('Error parsing cached data:', parseError);
          // Continue to next middleware if cache data is corrupted
        }
      }

      logger.info(`Cache miss for key: ${cacheKey}`);
      
      // Store cache key in request for downstream handlers
      (req as any).cacheKey = cacheKey;
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      // Continue without caching if Redis is unavailable
      next();
    }
  };
};

/**
 * Middleware to cache successful responses
 */
export const setCacheMiddleware = (ttl?: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const cacheKey = (req as any).cacheKey || (req as any).redisKey;
        
        if (cacheKey) {
          const cacheData: CacheData = {
            price: typeof data === 'string' ? JSON.parse(data).price : data.price,
            source: 'alchemy',
            timestamp: new Date().toISOString(),
            cachedAt: new Date().toISOString()
          };

          // Cache the response asynchronously
          redisService.set(cacheKey, JSON.stringify(cacheData), ttl)
            .then(() => {
              logger.info(`Data cached with key: ${cacheKey}`);
            })
            .catch((error) => {
              logger.error('Error caching data:', error);
            });
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Generate default cache key for price requests
 */
function generateDefaultCacheKey(req: Request): string {
  const { token, network, timestamp } = req.body;
  
  // Check if we have the required fields
  if (!token || !network) {
    // Fallback key generation for requests without proper body
    return `request:${req.method}:${req.path}:${Date.now()}`;
  }
  
  // Use timestamp or current time if not provided
  const effectiveTimestamp = timestamp || new Date().toISOString();
  
  return redisService.generateKey(token, network, effectiveTimestamp);
}

/**
 * Price-specific cache middleware
 */
export const priceCacheMiddleware = cacheMiddleware((req: Request) => {
  const { token, network, timestamp } = req.body;
  return redisService.generateKey(token, network, timestamp);
});

/**
 * Clear cache for specific keys
 */
export const clearCacheMiddleware = (keyPattern?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (keyPattern) {
        // In a real implementation, you might want to use Redis SCAN
        // to find and delete keys matching a pattern
        await redisService.del(keyPattern);
        logger.info(`Cache cleared for pattern: ${keyPattern}`);
      } else {
        // Clear all cache
        await redisService.flush();
        logger.info('All cache cleared');
      }
      
      next();
    } catch (error) {
      logger.error('Error clearing cache:', error);
      next();
    }
  };
};

/**
 * Cache health check middleware
 */
export const cacheHealthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (redisService.isReady()) {
    (req as any).cacheStatus = 'healthy';
  } else {
    (req as any).cacheStatus = 'unhealthy';
  }
  
  next();
};

const cacheMiddlewares = {
  cacheMiddleware,
  setCacheMiddleware,
  priceCacheMiddleware,
  clearCacheMiddleware,
  cacheHealthMiddleware
};

export default cacheMiddlewares;
