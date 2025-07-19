import { Job } from 'bullmq';
import bullMQService, { PriceHistoryJobData, PriceHistoryJobResult } from '../services/bullmq';
import alchemyService from '../services/alchemy';
import mongodbService from '../services/mongodb';
import interpolationService from '../services/interpolation';
import tokenUtils from '../utils/tokenUtils';
import logger from '../utils/logger';

/**
 * Process price history job
 */
export async function processPriceHistoryJob(
  job: Job<PriceHistoryJobData>
): Promise<PriceHistoryJobResult> {
  const { token, network, startDate, endDate, requestId } = job.data;
  const jobId = job.id;
  const startTime = Date.now();
  
  logger.info(`Processing price history job ${jobId} for ${token} on ${network}`);
  
  try {
    // Update job progress
    await job.updateProgress(10);
    
    // Step 1: Detect token creation date if not provided
    let actualStartDate = startDate;
    if (!actualStartDate) {
      logger.info(`Detecting creation date for ${token}`);
      const creationResult = await tokenUtils.detectTokenCreationDate(token, network);
      
      if (creationResult.creationDate) {
        actualStartDate = creationResult.creationDate;
        logger.info(`Token ${token} created on ${actualStartDate}`);
      } else {
        // Fallback to 1 year ago if detection fails
        actualStartDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        logger.warn(`Could not detect creation date for ${token}, using fallback: ${actualStartDate}`);
      }
    }
    
    await job.updateProgress(20);
    
    // Step 2: Generate timestamp range
    const actualEndDate = endDate || new Date().toISOString();
    const timestamps = tokenUtils.generateDailyTimestamps(actualStartDate, actualEndDate);
    
    logger.info(`Generated ${timestamps.length} timestamps for ${token}`);
    await job.updateProgress(30);
    
    // Step 3: Fetch existing price data from MongoDB
    const existingPrices = await mongodbService.getPriceHistory(token, network, new Date(actualStartDate), new Date(actualEndDate));
    const existingDates = new Set(existingPrices.map(p => new Date(p.date).toISOString().split('T')[0]));
    
    logger.info(`Found ${existingPrices.length} existing price records for ${token}`);
    await job.updateProgress(40);
    
    // Step 4: Filter timestamps to only fetch missing data
    const missingTimestamps = timestamps.filter(ts => {
      const dateStr = ts.split('T')[0];
      return !existingDates.has(dateStr);
    });
    
    logger.info(`Need to fetch ${missingTimestamps.length} missing price records`);
    await job.updateProgress(50);
    
    // Step 5: Fetch missing price data in batches
    const batchSize = tokenUtils.calculateOptimalBatchSize(missingTimestamps.length);
    const fetchedPrices: Array<{ date: string; price: number; confidence: number }> = [];
    const errors: string[] = [];
    
    for (let i = 0; i < missingTimestamps.length; i += batchSize) {
      const batch = missingTimestamps.slice(i, i + batchSize);
      
      logger.info(`Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(missingTimestamps.length / batchSize)} for ${token}`);
      
      for (const timestamp of batch) {
        try {
          const priceData = await alchemyService.getTokenPrice(token, network as any, timestamp);
          
          if (priceData && priceData.price !== null) {
            fetchedPrices.push({
              date: timestamp,
              price: priceData.price,
              confidence: 1.0 // Direct API data has full confidence
            });
          } else {
            // Add to errors for potential interpolation
            errors.push(`No price data for ${timestamp}`);
          }
        } catch (error) {
          const errorMsg = `Error fetching price for ${timestamp}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          logger.warn(errorMsg);
        }
      }
      
      // Update progress after each batch
      const progress = 50 + Math.floor((i + batchSize) / missingTimestamps.length * 30);
      await job.updateProgress(Math.min(progress, 80));
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.info(`Fetched ${fetchedPrices.length} new price records for ${token}`);
    await job.updateProgress(80);
    
    // Step 6: Interpolate missing data if needed
    if (errors.length > 0 && fetchedPrices.length > 0) {
      logger.info(`Attempting to interpolate ${errors.length} missing prices for ${token}`);
      
      // Combine existing and fetched prices for interpolation
      const allPrices = [
        ...existingPrices.map(p => ({ date: new Date(p.date).toISOString(), price: p.price, confidence: 1.0 })),
        ...fetchedPrices
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Find gaps and interpolate using batch interpolation
      const missingTimestamps = timestamps.filter(ts => !fetchedPrices.some(fp => fp.date === ts));
      const interpolatedResults = await interpolationService.batchInterpolatePrice(
        token,
        network,
        missingTimestamps.map(ts => new Date(ts).getTime())
      );
      
      const interpolatedPrices = interpolatedResults
        .filter(result => result !== null)
        .map((result, index) => ({
          date: new Date(missingTimestamps[index]).toISOString(),
          price: result!.price,
          confidence: result!.confidence
        }));
      
      fetchedPrices.push(...interpolatedPrices);
      logger.info(`Interpolated ${interpolatedPrices.length} additional price records for ${token}`);
    }
    
    await job.updateProgress(90);
    
    // Step 7: Save to MongoDB
    if (fetchedPrices.length > 0) {
      const priceRecords = fetchedPrices.map(fp => ({
        token: token.toUpperCase(),
        network: network.toLowerCase(),
        date: new Date(fp.date),
        price: fp.price,
        confidence: fp.confidence,
        source: fp.confidence === 1.0 ? 'alchemy' : 'interpolated'
      }));
      
      await mongodbService.savePriceHistory(priceRecords);
      logger.info(`Saved ${priceRecords.length} price records to MongoDB for ${token}`);
    }
    
    await job.updateProgress(100);
    
    const result: PriceHistoryJobResult = {
      token: token.toUpperCase(),
      network: network.toLowerCase(),
      pricesProcessed: fetchedPrices.length,
      timeRange: {
        start: actualStartDate,
        end: actualEndDate
      },
      duration: Date.now() - startTime,
      errors: errors.slice(0, 10) // Limit error list
    };
    
    logger.info(`Price history job ${jobId} completed successfully: ${result.pricesProcessed} prices processed`);
    return result;
    
  } catch (error) {
    const errorMsg = `Price history job ${jobId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    logger.error(errorMsg, error);
    
    throw new Error(errorMsg);
  }
}

/**
 * Initialize the BullMQ worker
 */
export function initializePriceHistoryWorker(): void {
  logger.info('Initializing price history worker');
  
  // The worker is automatically created in the BullMQ service
  // This function can be used to add additional worker configuration
  
  logger.info('Price history worker initialized');
}

const priceHistoryWorker = {
  processPriceHistoryJob,
  initializePriceHistoryWorker
};

export default priceHistoryWorker;
