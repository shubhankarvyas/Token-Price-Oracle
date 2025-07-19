import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import alchemyService from '../services/alchemy';
import mongoService from '../services/mongodb';
import { interpolatePrice } from '../services/interpolation';
import logger from '../utils/logger';
import { PriceRequest, PriceResponse, NetworkType } from '../types';

/**
 * GET /api/price - Get token price
 * POST /api/price - Get token price with body params
 */
export const getPrice = async (req: Request, res: Response): Promise<void> => {
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

    // Extract parameters from body (POST) or query (GET)
    const token = req.body.token || req.query.token as string;
    const network = req.body.network || req.query.network as string;
    const timestamp = req.body.timestamp || req.query.timestamp as string || new Date().toISOString();

    logger.info(`Price request for ${token} on ${network} at ${timestamp}`);

    // Validate token format (contract address or symbol)
    const isContractAddress = alchemyService.isValidTokenAddress(token);
    const isTokenSymbol = /^[A-Z0-9]{2,10}$/i.test(token);
    
    if (!isContractAddress && !isTokenSymbol) {
      res.status(400).json({
        error: 'Invalid token format',
        message: 'Token must be a valid contract address (0x...) or symbol (BTC, ETH)'
      });
      return;
    }

    // Validate network
    const supportedNetworks = alchemyService.getSupportedNetworks();
    if (!supportedNetworks.includes(network as NetworkType)) {
      res.status(400).json({
        error: 'Unsupported network',
        supportedNetworks
      });
      return;
    }

    // Validate timestamp
    const timestampDate = new Date(timestamp);
    if (isNaN(timestampDate.getTime())) {
      res.status(400).json({
        error: 'Invalid timestamp format'
      });
      return;
    }

    // Check if timestamp is in the future
    if (timestampDate > new Date()) {
      res.status(400).json({
        error: 'Timestamp cannot be in the future'
      });
      return;
    }

    const unixTimestamp = Math.floor(timestampDate.getTime() / 1000);

    // Step 1: Check if we already have this exact price in MongoDB
    const existingPrice = await mongoService.findPriceByTimestamp(token, network, unixTimestamp);
    if (existingPrice) {
      logger.info(`Found existing price in MongoDB: ${token} = $${existingPrice.price}`);
      
      const response: PriceResponse = {
        price: existingPrice.price,
        source: existingPrice.source,
        timestamp: existingPrice.date,
        token: existingPrice.token,
        network: existingPrice.network
      };
      
      res.json(response);
      return;
    }

    // Step 2: Try to fetch from Alchemy
    const priceData = await alchemyService.getTokenPrice(token, network as NetworkType, timestamp);

    if (priceData) {
      // Save to MongoDB for future use
      try {
        await mongoService.createPrice({
          token: token.toUpperCase(),
          network: network.toLowerCase(),
          date: timestamp,
          timestamp: unixTimestamp,
          price: priceData.price,
          source: 'alchemy'
        });
        logger.info(`Saved Alchemy price to MongoDB: ${token} = $${priceData.price}`);
      } catch (error) {
        logger.warn('Failed to save Alchemy price to MongoDB:', error);
      }

      const response: PriceResponse = {
        price: priceData.price,
        source: 'alchemy',
        timestamp: priceData.timestamp,
        token,
        network
      };

      logger.info(`Price fetched from Alchemy: ${token} = $${priceData.price}`);
      res.json(response);
      return;
    }

    // Step 3: Try interpolation if Alchemy fails
    logger.info(`Alchemy failed, attempting interpolation for ${token} on ${network}`);
    
    const interpolationResult = await interpolatePrice(token, network, unixTimestamp);
    
    if (interpolationResult) {
      // Save interpolated price to MongoDB
      try {
        await mongoService.createPrice({
          token: token.toUpperCase(),
          network: network.toLowerCase(),
          date: timestamp,
          timestamp: unixTimestamp,
          price: interpolationResult.price,
          source: 'interpolated'
        });
        logger.info(`Saved interpolated price to MongoDB: ${token} = $${interpolationResult.price}`);
      } catch (error) {
        logger.warn('Failed to save interpolated price to MongoDB:', error);
      }

      const response: PriceResponse = {
        price: interpolationResult.price,
        source: 'interpolated',
        timestamp: timestamp,
        token,
        network
      };

      logger.info(`Price interpolated: ${token} = $${interpolationResult.price} (confidence: ${interpolationResult.confidence.toFixed(2)})`);
      res.json(response);
      return;
    }

    // Step 4: No price data available
    res.status(404).json({
      error: 'Price data not found',
      message: `No price data available for ${token} on ${network} at ${timestamp}. Neither Alchemy nor interpolation could provide a price.`
    });

  } catch (error) {
    logger.error('Error in getPrice:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch price data'
    });
  }
};

/**
 * GET /api/price/history - Get price history for a token
 */
export const getPriceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, network, from, to, interval = '1h' } = req.query;

    if (!token || !network || !from || !to) {
      res.status(400).json({
        error: 'Missing required parameters',
        required: ['token', 'network', 'from', 'to']
      });
      return;
    }

    logger.info(`Price history request for ${token} on ${network} from ${from} to ${to}`);

    // This is a simplified implementation
    // In a real application, you would fetch historical data from your database
    // or make multiple API calls to get historical prices

    const mockHistory = [];
    const startDate = new Date(from as string);
    const endDate = new Date(to as string);
    const intervalMs = getIntervalMs(interval as string);

    for (let date = startDate; date <= endDate; date = new Date(date.getTime() + intervalMs)) {
      const priceData = await alchemyService.getTokenPrice(
        token as string,
        network as NetworkType,
        date.toISOString()
      );

      if (priceData) {
        mockHistory.push({
          timestamp: date.toISOString(),
          price: priceData.price,
          source: 'alchemy'
        });
      }
    }

    res.json({
      token,
      network,
      period: `${from} to ${to}`,
      interval,
      prices: mockHistory
    });

  } catch (error) {
    logger.error('Error in getPriceHistory:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch price history'
    });
  }
};

/**
 * GET /api/price/supported-networks - Get supported networks
 */
export const getSupportedNetworks = async (req: Request, res: Response): Promise<void> => {
  try {
    const networks = alchemyService.getSupportedNetworks();
    res.json({
      networks,
      total: networks.length
    });
  } catch (error) {
    logger.error('Error in getSupportedNetworks:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch supported networks'
    });
  }
};

/**
 * Helper function to convert interval string to milliseconds
 */
function getIntervalMs(interval: string): number {
  switch (interval.toLowerCase()) {
    case '1m':
      return 60 * 1000;
    case '5m':
      return 5 * 60 * 1000;
    case '15m':
      return 15 * 60 * 1000;
    case '30m':
      return 30 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
    case '4h':
      return 4 * 60 * 60 * 1000;
    case '1d':
      return 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000; // Default to 1 hour
  }
}
