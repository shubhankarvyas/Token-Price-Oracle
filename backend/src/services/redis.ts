import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = process.env.REDIS_ENABLED !== 'false' && !!process.env.REDIS_URL;
    
    if (this.isEnabled) {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD || undefined,
        database: parseInt(process.env.REDIS_DB || '0')
      });

      this.client.on('error', (error) => {
        logger.error('Redis Client Error:', error);
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });
    } else {
      logger.info('Redis is disabled');
    }
  }

  async connect(): Promise<void> {
    if (!this.isEnabled || !this.client) {
      logger.info('Redis connection skipped (disabled or no client)');
      return;
    }

    try {
      await this.client.connect();
      logger.info('Redis connection established');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isEnabled || !this.client) {
      return;
    }

    try {
      await this.client.disconnect();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn('Redis not connected, skipping get operation');
        return null;
      }
      
      const value = await this.client.get(key);
      logger.debug(`Redis GET ${key}: ${value ? 'found' : 'not found'}`);
      return value;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn('Redis not connected, skipping set operation');
        return false;
      }

      const ttlSeconds = ttl || parseInt(process.env.REDIS_TTL || '3600');
      await this.client.setEx(key, ttlSeconds, value);
      logger.debug(`Redis SET ${key} with TTL ${ttlSeconds}s`);
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn('Redis not connected, skipping delete operation');
        return false;
      }

      const result = await this.client.del(key);
      logger.debug(`Redis DEL ${key}: ${result > 0 ? 'deleted' : 'not found'}`);
      return result > 0;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        logger.warn('Redis not connected, skipping flush operation');
        return false;
      }

      await this.client.flushDb();
      logger.info('Redis database flushed');
      return true;
    } catch (error) {
      logger.error('Redis FLUSH error:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  generateKey(token: string, network: string, timestamp: string): string {
    // Ensure all parameters are strings and handle undefined/null
    const safeToken = token?.toString()?.toLowerCase() || 'unknown';
    const safeNetwork = network?.toString()?.toLowerCase() || 'unknown';
    const safeTimestamp = timestamp?.toString() || new Date().toISOString();
    
    return `price:${safeToken}:${safeNetwork}:${safeTimestamp}`;
  }
}

const redisService = new RedisService();
export default redisService;
