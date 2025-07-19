import mongoose, { Schema, Document } from 'mongoose';
import logger from '../utils/logger';

// Interface for Price document
export interface IPriceDocument extends Document {
  token: string;
  network: string;
  date: string; // ISO string
  timestamp: number; // Unix timestamp
  price: number;
  source: 'alchemy' | 'interpolated';
  createdAt: Date;
  updatedAt: Date;
}

// Price schema
const PriceSchema = new Schema<IPriceDocument>({
  token: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  network: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    enum: ['alchemy', 'interpolated'],
    default: 'alchemy'
  }
}, {
  timestamps: true,
  collection: 'prices'
});

// Compound indexes for efficient queries
PriceSchema.index({ token: 1, network: 1, timestamp: 1 }, { unique: true });
PriceSchema.index({ token: 1, network: 1, timestamp: -1 });
PriceSchema.index({ timestamp: 1 });

// Static methods
PriceSchema.statics.findByTokenAndNetwork = function(token: string, network: string) {
  return this.find({ token: token.toUpperCase(), network: network.toLowerCase() })
    .sort({ timestamp: -1 });
};

PriceSchema.statics.findClosestPrices = function(token: string, network: string, timestamp: number) {
  const upperToken = token.toUpperCase();
  const lowerNetwork = network.toLowerCase();
  
  return Promise.all([
    // Find closest price before timestamp
    this.findOne({
      token: upperToken,
      network: lowerNetwork,
      timestamp: { $lte: timestamp }
    }).sort({ timestamp: -1 }),
    
    // Find closest price after timestamp
    this.findOne({
      token: upperToken,
      network: lowerNetwork,
      timestamp: { $gte: timestamp }
    }).sort({ timestamp: 1 })
  ]);
};

// Instance methods
PriceSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Create and export the model
export const Price = mongoose.model<IPriceDocument>('Price', PriceSchema);

// MongoDB connection class
class MongoDBService {
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/token-price-db';
      
      await mongoose.connect(mongoUri, {
        dbName: process.env.MONGODB_DB_NAME || 'token-price-db',
        retryWrites: true,
        w: 'majority'
      });

      this.isConnected = true;
      logger.info('MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
    }
  }

  isReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  async createPrice(priceData: Partial<IPriceDocument>): Promise<IPriceDocument> {
    try {
      const price = new Price(priceData);
      return await price.save();
    } catch (error) {
      if (error instanceof Error && error.name === 'MongoError' && (error as any).code === 11000) {
        // Duplicate key error - price already exists
        logger.warn(`Price already exists for ${priceData.token} on ${priceData.network} at ${priceData.timestamp}`);
        throw new Error('Price data already exists for this timestamp');
      }
      throw error;
    }
  }

  async findPriceByTimestamp(token: string, network: string, timestamp: number): Promise<IPriceDocument | null> {
    // Check if MongoDB is connected
    if (!this.isReady()) {
      logger.warn('MongoDB not connected, skipping database query');
      return null;
    }
    
    try {
      return await Price.findOne({
        token: token.toUpperCase(),
        network: network.toLowerCase(),
        timestamp
      });
    } catch (error) {
      logger.error('Error finding price by timestamp:', error);
      return null;
    }
  }

  async findClosestPrices(token: string, network: string, timestamp: number): Promise<[IPriceDocument | null, IPriceDocument | null]> {
    // Check if MongoDB is connected
    if (!this.isReady()) {
      logger.warn('MongoDB not connected, skipping closest prices query');
      return [null, null];
    }
    
    try {
      return await (Price as any).findClosestPrices(token, network, timestamp);
    } catch (error) {
      logger.error('Error finding closest prices:', error);
      return [null, null];
    }
  }

  async savePrices(prices: Partial<IPriceDocument>[]): Promise<IPriceDocument[]> {
    // Check if MongoDB is connected
    if (!this.isReady()) {
      logger.warn('MongoDB not connected, skipping price save operation');
      return [];
    }
    
    try {
      return await Price.insertMany(prices, { ordered: false });
    } catch (error) {
      if (error instanceof Error && error.name === 'BulkWriteError') {
        // Handle duplicate key errors in bulk insert
        const bulkError = error as any;
        const successfulInserts = bulkError.result?.insertedCount || 0;
        logger.warn(`Bulk insert completed with ${successfulInserts} successful inserts and ${bulkError.writeErrors?.length || 0} errors`);
        return bulkError.result?.insertedIds || [];
      }
      throw error;
    }
  }

  async getPriceHistory(token: string, network: string, startDate: Date, endDate: Date): Promise<IPriceDocument[]> {
    return await Price.find({
      token: token.toUpperCase(),
      network: network.toLowerCase(),
      timestamp: {
        $gte: Math.floor(startDate.getTime() / 1000),
        $lte: Math.floor(endDate.getTime() / 1000)
      }
    }).sort({ timestamp: 1 });
  }

  async savePriceHistory(priceRecords: Array<{
    token: string;
    network: string;
    date: Date;
    price: number;
    confidence: number;
    source: string;
  }>): Promise<IPriceDocument[]> {
    try {
      // Convert date-based records to timestamp-based records
      const priceData = priceRecords.map(record => ({
        token: record.token.toUpperCase(),
        network: record.network.toLowerCase(),
        price: record.price,
        timestamp: Math.floor(record.date.getTime() / 1000),
        date: record.date.toISOString(),
        confidence: record.confidence,
        source: record.source as 'alchemy' | 'interpolated'
      }));

      return await this.savePrices(priceData);
    } catch (error) {
      logger.error('Error saving price history:', error);
      throw error;
    }
  }
}

const mongoService = new MongoDBService();
export default mongoService;
