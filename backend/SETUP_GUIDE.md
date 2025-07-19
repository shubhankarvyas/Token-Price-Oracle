# Complete Setup Guide for Token Price API

This guide will help you set up all the necessary services and API keys for the Token Price API.

## Required Services & API Keys

### 1. Alchemy API Key (Required - for blockchain data)

**What it's for**: Fetching token prices and blockchain data from Ethereum, Polygon, etc.

**How to get it**:
1. Go to [https://www.alchemy.com/](https://www.alchemy.com/)
2. Sign up for a free account
3. Create a new app:
   - Choose "Ethereum" as the network
   - Select "Mainnet" for production or "Sepolia" for testing
   - Give your app a name like "Token Price API"
4. Copy your API key from the dashboard

**Free tier**: 300M compute units per month (very generous for testing)

### 2. MongoDB (Required - for data storage)

**Option A: Local MongoDB (Recommended for development)**
```bash
# Install MongoDB using Homebrew on macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for free
3. Create a new cluster (free tier available)
4. Get your connection string from the cluster dashboard

### 3. Redis (Required - for caching and job queue)

**Option A: Local Redis (Recommended for development)**
```bash
# Install Redis using Homebrew on macOS
brew install redis
brew services start redis
```

**Option B: Redis Cloud**
1. Go to [https://redis.com/try-free/](https://redis.com/try-free/)
2. Sign up for free
3. Create a new database
4. Get your connection string

## Environment Setup

### Step 1: Create .env file

Copy the example environment file:
```bash
cp .env.example .env
```

### Step 2: Fill in your API keys

Edit the `.env` file with your actual values:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
API_PREFIX=/api

# MongoDB Configuration (Local)
MONGODB_URI=mongodb://localhost:27017/token-price-db
MONGODB_DB_NAME=token-price-db

# MongoDB Configuration (Atlas - if using cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/token-price-db?retryWrites=true&w=majority
# MONGODB_DB_NAME=token-price-db

# Alchemy Configuration
ALCHEMY_API_KEY=your_actual_alchemy_api_key_here
ALCHEMY_NETWORK=eth-mainnet

# Redis Configuration (Local)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# Redis Configuration (Cloud - if using Redis Cloud)
# REDIS_URL=redis://username:password@host:port
# REDIS_PASSWORD=your_redis_password
# REDIS_DB=0
# REDIS_TTL=3600

# BullMQ Configuration
BULLMQ_REDIS_URL=redis://localhost:6379
BULLMQ_QUEUE_NAME=price-history

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Security
JWT_SECRET=your_random_jwt_secret_here_make_it_long_and_complex
BCRYPT_ROUNDS=12
```

## Quick Setup for Development

If you want to get started quickly with local services:

### 1. Install and start services
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Install Redis
brew install redis
brew services start redis

# Verify services are running
brew services list | grep -E "(mongodb|redis)"
```

### 2. Get Alchemy API key
- Sign up at [https://www.alchemy.com/](https://www.alchemy.com/)
- Create a new app
- Copy your API key

### 3. Update .env file
```bash
# Only change these lines in your .env file:
ALCHEMY_API_KEY=your_actual_alchemy_api_key_here
JWT_SECRET=super_secret_jwt_key_for_development_only_12345
```

## Testing Your Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Build the project
```bash
npm run build
```

### 3. Start the server
```bash
npm start
```

### 4. Test the API
```bash
# Test basic endpoint
curl http://localhost:3001/api/health

# Test price endpoint (requires Alchemy API key)
curl "http://localhost:3001/api/price?token=0xA0b86a33E6417C0b9c1FA2b2B89C4da3e3d1e4a1&network=ethereum"
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community@7.0

# Check MongoDB logs
brew services start mongodb-community@7.0 && tail -f /usr/local/var/log/mongodb/mongo.log
```

### Redis Connection Issues
```bash
# Check if Redis is running
brew services list | grep redis

# Start Redis if not running
brew services start redis

# Test Redis connection
redis-cli ping
```

### Alchemy API Issues
- Make sure your API key is correct
- Check if you have compute units left in your Alchemy dashboard
- Verify the network name matches what you selected in Alchemy

## Production Considerations

For production deployment, consider:
1. **MongoDB Atlas** for managed database
2. **Redis Cloud** for managed Redis
3. **Environment-specific** API keys
4. **Proper security** settings
5. **Load balancing** and **monitoring**

## Cost Breakdown (Monthly)

- **Alchemy**: Free tier (300M compute units)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Redis Cloud**: Free tier (30MB)
- **Local Development**: Free

Total cost for development: **$0/month**
