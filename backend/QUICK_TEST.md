# Quick Test Setup - No External Dependencies

If you want to test the API immediately without setting up external services, follow these steps:

## 1. Create a test environment file

Create a `.env` file with mock/test values:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
API_PREFIX=/api

# MongoDB Configuration (we'll mock this)
MONGODB_URI=mongodb://localhost:27017/token-price-db
MONGODB_DB_NAME=token-price-db

# Alchemy Configuration (we'll mock this)
ALCHEMY_API_KEY=test-key-for-mock-data
ALCHEMY_NETWORK=eth-mainnet

# Redis Configuration (we'll mock this)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# BullMQ Configuration (we'll mock this)
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
JWT_SECRET=test_jwt_secret_for_development_only
BCRYPT_ROUNDS=12
```

## 2. Test Commands

After creating the .env file, you can test:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

The server will start but will show warnings about missing services. This is normal for testing.

## 3. Available Test Endpoints

Even without external services, these endpoints will work:

```bash
# Health check
curl http://localhost:3001/api/health

# Server info
curl http://localhost:3001/

# Price endpoint (will return mock data or error gracefully)
curl "http://localhost:3001/api/price?token=WETH&network=ethereum"
```

## 4. What Will Work vs What Won't

**✅ Will Work:**
- Server startup
- Basic API endpoints
- Error handling
- CORS and security middleware
- Request logging

**❌ Won't Work (but will fail gracefully):**
- Actual price fetching (needs Alchemy API key)
- Data persistence (needs MongoDB)
- Caching (needs Redis)
- Background jobs (needs Redis/BullMQ)

## 5. Next Steps

Once you're ready to test with real data:
1. Get an Alchemy API key (free at alchemy.com)
2. Install local MongoDB and Redis
3. Update your .env file with real values
4. Restart the server

The API is designed to work gracefully even when services are unavailable, so you can test the basic functionality immediately!
