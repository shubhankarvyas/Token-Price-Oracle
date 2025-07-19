import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import logger from '../utils/logger';

interface TokenCreationResult {
  token: string;
  network: string;
  creationDate: string | null;
  deploymentTx: string | null;
  deploymentBlock: number | null;
  error?: string;
}

/**
 * Detect token creation date using Alchemy getAssetTransfers
 */
export async function detectTokenCreationDate(
  token: string,
  network: string
): Promise<TokenCreationResult> {
  try {
    logger.info(`Detecting creation date for token ${token} on ${network}`);

    // Get Alchemy instance
    const alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY || '',
      network: network.toLowerCase() as Network
    });

    // Get the earliest transfer events for this token
    const transfers = await alchemy.core.getAssetTransfers({
      contractAddresses: [token],
      category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
      fromBlock: '0x0',
      toBlock: 'latest',
      maxCount: 1,
      order: SortingOrder.ASCENDING
    });

    if (transfers.transfers.length === 0) {
      logger.warn(`No transfers found for token ${token} on ${network}`);
      return {
        token,
        network,
        creationDate: null,
        deploymentTx: null,
        deploymentBlock: null,
        error: 'No transfers found'
      };
    }

    const firstTransfer = transfers.transfers[0];
    
    // Get block details to get timestamp
    const blockDetails = await alchemy.core.getBlock(firstTransfer.blockNum);
    
    if (!blockDetails) {
      logger.warn(`Could not get block details for block ${firstTransfer.blockNum}`);
      return {
        token,
        network,
        creationDate: null,
        deploymentTx: firstTransfer.hash,
        deploymentBlock: parseInt(firstTransfer.blockNum, 16),
        error: 'Could not get block timestamp'
      };
    }

    const creationDate = new Date(blockDetails.timestamp * 1000).toISOString();
    
    logger.info(`Token ${token} created on ${creationDate}`);

    return {
      token,
      network,
      creationDate,
      deploymentTx: firstTransfer.hash,
      deploymentBlock: parseInt(firstTransfer.blockNum, 16)
    };

  } catch (error) {
    logger.error(`Error detecting token creation date for ${token}:`, error);
    return {
      token,
      network,
      creationDate: null,
      deploymentTx: null,
      deploymentBlock: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate daily timestamps from token creation date to current date
 */
export function generateDailyTimestamps(startDate: string, endDate?: string): string[] {
  const timestamps: string[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  // Normalize to UTC midnight
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    timestamps.push(currentDate.toISOString());
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return timestamps;
}

/**
 * Calculate the optimal batch size for price history fetching
 */
export function calculateOptimalBatchSize(
  totalDays: number,
  maxBatchSize: number = 100,
  minBatchSize: number = 10
): number {
  if (totalDays <= minBatchSize) return totalDays;
  if (totalDays <= maxBatchSize) return Math.ceil(totalDays / 2);
  
  // For large ranges, use a reasonable batch size
  return Math.max(minBatchSize, Math.min(maxBatchSize, Math.ceil(totalDays / 10)));
}

/**
 * Get price history fetch strategy based on token age
 */
export function getPriceHistoryStrategy(creationDate: string): {
  strategy: 'full' | 'recent' | 'sample';
  description: string;
  maxDays: number;
} {
  const now = new Date();
  const created = new Date(creationDate);
  const daysSinceCreation = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceCreation <= 30) {
    return {
      strategy: 'full',
      description: 'Fetch complete price history (token is new)',
      maxDays: daysSinceCreation
    };
  } else if (daysSinceCreation <= 365) {
    return {
      strategy: 'recent',
      description: 'Fetch recent 6 months + weekly samples for older data',
      maxDays: 180
    };
  } else {
    return {
      strategy: 'sample',
      description: 'Fetch recent 3 months + monthly samples for older data',
      maxDays: 90
    };
  }
}

const tokenUtils = {
  detectTokenCreationDate,
  generateDailyTimestamps,
  calculateOptimalBatchSize,
  getPriceHistoryStrategy
};

export default tokenUtils;
