import mongoService from '../services/mongodb';
import logger from '../utils/logger';

/**
 * Interpolation Engine for Token Prices
 * 
 * This function performs linear interpolation between two known price points
 * to estimate the price at a specific timestamp.
 */

export interface InterpolationResult {
  price: number;
  source: 'interpolated';
  confidence: number; // 0-1 scale indicating interpolation confidence
  dataPoints: {
    before: {
      timestamp: number;
      price: number;
      timeDiff: number;
    } | null;
    after: {
      timestamp: number;
      price: number;
      timeDiff: number;
    } | null;
  };
}

/**
 * Interpolates token price based on closest known prices
 * 
 * @param token - Token symbol (e.g., 'BTC', 'ETH')
 * @param network - Network name (e.g., 'ethereum', 'polygon')
 * @param queryTimestamp - Target timestamp for interpolation
 * @returns Interpolated price result or null if insufficient data
 */
export async function interpolatePrice(
  token: string,
  network: string,
  queryTimestamp: number
): Promise<InterpolationResult | null> {
  try {
    logger.info(`Interpolating price for ${token} on ${network} at timestamp ${queryTimestamp}`);

    // Find closest prices before and after the query timestamp
    const [beforePrice, afterPrice] = await mongoService.findClosestPrices(
      token,
      network,
      queryTimestamp
    );

    // Check if we have sufficient data for interpolation
    if (!beforePrice && !afterPrice) {
      logger.warn(`No price data found for ${token} on ${network}`);
      return null;
    }

    // If we only have one data point, we can't interpolate
    if (!beforePrice || !afterPrice) {
      logger.warn(`Insufficient data for interpolation: ${token} on ${network}`);
      return null;
    }

    const ts1 = beforePrice.timestamp;
    const ts2 = afterPrice.timestamp;
    const price1 = beforePrice.price;
    const price2 = afterPrice.price;

    // Ensure we have different timestamps
    if (ts1 === ts2) {
      logger.warn(`Same timestamp for both data points: ${ts1}`);
      return null;
    }

    // Calculate interpolation ratio
    const ratio = (queryTimestamp - ts1) / (ts2 - ts1);

    // Perform linear interpolation
    const interpolatedPrice = price1 + (price2 - price1) * ratio;

    // Calculate confidence based on time gap and price stability
    const confidence = calculateInterpolationConfidence(
      queryTimestamp,
      ts1,
      ts2,
      price1,
      price2
    );

    const result: InterpolationResult = {
      price: Math.round(interpolatedPrice * 100) / 100, // Round to 2 decimal places
      source: 'interpolated',
      confidence,
      dataPoints: {
        before: {
          timestamp: ts1,
          price: price1,
          timeDiff: queryTimestamp - ts1
        },
        after: {
          timestamp: ts2,
          price: price2,
          timeDiff: ts2 - queryTimestamp
        }
      }
    };

    logger.info(`Interpolated price for ${token}: $${result.price} (confidence: ${confidence.toFixed(2)})`);
    return result;

  } catch (error) {
    logger.error('Error in interpolatePrice:', error);
    return null;
  }
}

/**
 * Calculate confidence score for interpolation
 * 
 * @param queryTs - Target timestamp
 * @param beforeTs - Before timestamp
 * @param afterTs - After timestamp
 * @param beforePrice - Before price
 * @param afterPrice - After price
 * @returns Confidence score (0-1)
 */
function calculateInterpolationConfidence(
  queryTs: number,
  beforeTs: number,
  afterTs: number,
  beforePrice: number,
  afterPrice: number
): number {
  // Time gap factor (closer timestamps = higher confidence)
  const totalGap = afterTs - beforeTs;
  const maxAcceptableGap = 7 * 24 * 60 * 60; // 7 days in seconds
  const timeConfidence = Math.max(0, 1 - (totalGap / maxAcceptableGap));

  // Price stability factor (smaller price changes = higher confidence)
  const priceChange = Math.abs(afterPrice - beforePrice) / beforePrice;
  const maxAcceptableChange = 0.5; // 50% change
  const stabilityConfidence = Math.max(0, 1 - (priceChange / maxAcceptableChange));

  // Position factor (query timestamp closer to center = higher confidence)
  const beforeGap = queryTs - beforeTs;
  const afterGap = afterTs - queryTs;
  const positionRatio = Math.min(beforeGap, afterGap) / Math.max(beforeGap, afterGap);
  const positionConfidence = positionRatio;

  // Combine factors with weights
  const confidence = (
    timeConfidence * 0.4 +
    stabilityConfidence * 0.4 +
    positionConfidence * 0.2
  );

  return Math.min(1, Math.max(0, confidence));
}

/**
 * Batch interpolation for multiple timestamps
 * 
 * @param token - Token symbol
 * @param network - Network name
 * @param timestamps - Array of timestamps to interpolate
 * @returns Array of interpolation results
 */
export async function batchInterpolatePrice(
  token: string,
  network: string,
  timestamps: number[]
): Promise<(InterpolationResult | null)[]> {
  const results: (InterpolationResult | null)[] = [];
  
  for (const timestamp of timestamps) {
    const result = await interpolatePrice(token, network, timestamp);
    results.push(result);
  }
  
  return results;
}

/**
 * Get interpolation statistics for a token
 * 
 * @param token - Token symbol
 * @param network - Network name
 * @returns Statistics about available data points
 */
export async function getInterpolationStats(
  token: string,
  network: string
): Promise<{
  dataPoints: number;
  dateRange: {
    earliest: number;
    latest: number;
    span: number;
  } | null;
  averageGap: number;
}> {
  try {
    // This would require additional queries to get full statistics
    // For now, return basic stats
    return {
      dataPoints: 0,
      dateRange: null,
      averageGap: 0
    };
  } catch (error) {
    logger.error('Error getting interpolation stats:', error);
    return {
      dataPoints: 0,
      dateRange: null,
      averageGap: 0
    };
  }
}

const interpolationService = {
  interpolatePrice,
  batchInterpolatePrice,
  getInterpolationStats
};

export default interpolationService;
