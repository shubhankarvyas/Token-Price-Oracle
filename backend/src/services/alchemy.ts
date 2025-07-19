import { Alchemy, Network, AssetTransfersCategory } from 'alchemy-sdk';
import axios from 'axios';
import logger from '../utils/logger';
import { AlchemyPriceData, NetworkType } from '../types';

class AlchemyService {
  private alchemy: Alchemy;
  private networkMap: Map<NetworkType, Network>;

  constructor() {
    const config = {
      apiKey: process.env.ALCHEMY_API_KEY || 'demo',
      network: this.getAlchemyNetwork(process.env.ALCHEMY_NETWORK || 'eth-mainnet')
    };

    this.alchemy = new Alchemy(config);

    // Map our network types to Alchemy networks
    this.networkMap = new Map([
      ['ethereum', Network.ETH_MAINNET],
      ['polygon', Network.MATIC_MAINNET],
      ['arbitrum', Network.ARB_MAINNET],
      ['optimism', Network.OPT_MAINNET],
      ['base', Network.BASE_MAINNET]
    ]);

    logger.info('Alchemy service initialized');
  }

  private getAlchemyNetwork(networkString: string): Network {
    switch (networkString) {
      case 'eth-mainnet':
        return Network.ETH_MAINNET;
      case 'eth-sepolia':
        return Network.ETH_SEPOLIA;
      case 'polygon-mainnet':
        return Network.MATIC_MAINNET;
      case 'polygon-mumbai':
        return Network.MATIC_MUMBAI;
      case 'arbitrum-mainnet':
        return Network.ARB_MAINNET;
      case 'arbitrum-sepolia':
        return Network.ARB_SEPOLIA;
      case 'optimism-mainnet':
        return Network.OPT_MAINNET;
      case 'optimism-sepolia':
        return Network.OPT_SEPOLIA;
      case 'base-mainnet':
        return Network.BASE_MAINNET;
      case 'base-sepolia':
        return Network.BASE_SEPOLIA;
      default:
        logger.warn(`Unknown network: ${networkString}, defaulting to ETH_MAINNET`);
        return Network.ETH_MAINNET;
    }
  }

  /**
   * Get token price from Alchemy
   * Note: This is a simplified implementation. In reality, you might need to:
   * 1. Use historical price APIs
   * 2. Handle token address resolution
   * 3. Implement proper error handling for different token types
   */
  async getTokenPrice(token: string, network: NetworkType, timestamp: string): Promise<AlchemyPriceData | null> {
    try {
      logger.info(`Fetching price for ${token} on ${network} at ${timestamp}`);

      // Switch to the appropriate network
      const alchemyNetwork = this.networkMap.get(network);
      if (!alchemyNetwork) {
        logger.error(`Unsupported network: ${network}`);
        return null;
      }

      // Create network-specific Alchemy instance
      const networkAlchemy = new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY || 'demo',
        network: alchemyNetwork
      });

      // Fetch real price data from CoinGecko API
      const realPrice = await this.fetchRealTokenPrice(token, network, timestamp);

      if (realPrice === null) {
        logger.warn(`No price data available for ${token} on ${network} at ${timestamp}`);
        return null;
      }

      const result: AlchemyPriceData = {
        price: realPrice,
        timestamp: timestamp
      };

      logger.info(`Successfully fetched price for ${token}: $${realPrice}`);
      return result;

    } catch (error) {
      logger.error(`Error fetching price from Alchemy:`, error);
      return null;
    }
  }

  /**
   * Fetch real token price from CoinGecko API
   * This replaces the mock implementation with real price data
   */
  private async fetchRealTokenPrice(token: string, network: NetworkType, timestamp: string): Promise<number | null> {
    try {
      // Map token symbols to CoinGecko IDs
      const tokenMap: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'MATIC': 'matic-network',
        'LINK': 'chainlink',
        'UNI': 'uniswap',
        'AAVE': 'aave',
        'COMP': 'compound-governance-token',
        'MKR': 'maker'
      };

      const coinId = tokenMap[token.toUpperCase()];
      if (!coinId) {
        logger.warn(`No CoinGecko mapping for token: ${token}`);
        return null;
      }

      // Check if timestamp is recent (within 24 hours) for current price
      const now = new Date();
      const requestTime = new Date(timestamp);
      const hoursDiff = (now.getTime() - requestTime.getTime()) / (1000 * 60 * 60);

      let apiUrl: string;

      if (hoursDiff <= 24) {
        // Use current price endpoint for recent requests
        apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
      } else {
        // Use historical price endpoint for older requests
        const dateStr = requestTime.toISOString().split('T')[0]; // YYYY-MM-DD format
        apiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${dateStr}`;
      }

      logger.info(`Fetching real price from CoinGecko: ${apiUrl}`);

      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TokenPriceOracle/1.0'
        },
        timeout: 10000 // 10 second timeout
      });

      const data = response.data;

      let price: number;

      if (hoursDiff <= 24) {
        // Current price response format
        price = data[coinId]?.usd;
      } else {
        // Historical price response format
        price = data.market_data?.current_price?.usd;
      }

      if (typeof price !== 'number' || isNaN(price)) {
        logger.warn(`Invalid price data received for ${token}: ${price}`);
        return null;
      }

      logger.info(`Successfully fetched real price for ${token}: $${price}`);
      return Math.round(price * 100) / 100; // Round to 2 decimal places

    } catch (error) {
      logger.error(`Error fetching real price for ${token}:`, error);
      return null;
    }
  }

  /**
   * Get token metadata (for future use)
   */
  async getTokenMetadata(contractAddress: string): Promise<any> {
    try {
      const metadata = await this.alchemy.core.getTokenMetadata(contractAddress);
      return metadata;
    } catch (error) {
      logger.error(`Error fetching token metadata for ${contractAddress}:`, error);
      return null;
    }
  }

  /**
   * Validate token address format
   */
  isValidTokenAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks(): NetworkType[] {
    return Array.from(this.networkMap.keys());
  }
}

const alchemyService = new AlchemyService();
export default alchemyService;
