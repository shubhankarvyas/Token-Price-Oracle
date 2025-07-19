export interface PriceRequest {
  token: string;
  network: string;
  timestamp: string;
}

export interface PriceResponse {
  price: number;
  source: 'cache' | 'alchemy' | 'interpolated';
  timestamp: string;
  token: string;
  network: string;
}

export interface ScheduleRequest {
  token: string;
  network: string;
  interval?: string; // cron format
  enabled?: boolean;
}

export interface ScheduleResponse {
  success: boolean;
  message: string;
  jobId: string;
  estimatedTime: number;
  scheduledAt: string;
}

export interface CacheData {
  price: number;
  source: 'cache' | 'alchemy' | 'interpolated';
  timestamp: string;
  cachedAt: string;
}

export interface AlchemyPriceData {
  price: number;
  timestamp: string;
}

export interface JobData {
  id: string;
  token: string;
  network: string;
  interval: string;
  enabled: boolean;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

export interface RequestWithCache {
  redisKey?: string;
  cacheData?: CacheData;
  body: any;
  params: any;
  query: any;
  headers: any;
}

export type NetworkType = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base';
export type SourceType = 'cache' | 'alchemy' | 'interpolated';

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  network: NetworkType;
}

export interface PriceHistory {
  prices: Array<{
    timestamp: string;
    price: number;
    source: SourceType;
  }>;
  token: string;
  network: string;
  period: string;
}
