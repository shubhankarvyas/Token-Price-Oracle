# Token Price API Documentation

A comprehensive backend API for token price management with Redis caching and Alchemy SDK integration.

## Features

- 🚀 **Express.js** server with TypeScript
- 🔄 **Redis caching** for improved performance
- 🔗 **Alchemy SDK** integration for token price fetching
- ⏰ **Job scheduling** with cron expressions
- 🛡️ **Security** middleware (Helmet, CORS, Rate limiting)
- 📝 **Input validation** with express-validator
- 🪵 **Logging** with Winston
- 📊 **Health checks** and monitoring

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development
API_PREFIX=/api

# Alchemy Configuration
ALCHEMY_API_KEY=your_alchemy_api_key_here
ALCHEMY_NETWORK=eth-mainnet

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Price Endpoints

#### Get Token Price
```
POST /api/price
Content-Type: application/json

{
  "token": "BTC",
  "network": "ethereum",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "price": 45000.50,
  "source": "alchemy",
  "timestamp": "2024-01-01T00:00:00Z",
  "token": "BTC",
  "network": "ethereum"
}
```

#### Get Price History
```
GET /api/price/history?token=BTC&network=ethereum&from=2024-01-01T00:00:00Z&to=2024-01-02T00:00:00Z&interval=1h
```

**Response:**
```json
{
  "token": "BTC",
  "network": "ethereum",
  "period": "2024-01-01T00:00:00Z to 2024-01-02T00:00:00Z",
  "interval": "1h",
  "prices": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "price": 45000.50,
      "source": "alchemy"
    }
  ]
}
```

#### Get Supported Networks
```
GET /api/price/supported-networks
```

**Response:**
```json
{
  "networks": ["ethereum", "polygon", "arbitrum", "optimism", "base"],
  "total": 5
}
```

### Schedule Endpoints

#### Schedule Job
```
POST /api/schedule
Content-Type: application/json

{
  "token": "BTC",
  "network": "ethereum",
  "interval": "0 */5 * * * *",
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job scheduled successfully for BTC on ethereum",
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "estimatedTime": 5000,
  "scheduledAt": "2024-01-01T00:00:00Z"
}
```

#### Get All Scheduled Jobs
```
GET /api/schedule
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "token": "BTC",
      "network": "ethereum",
      "interval": "0 */5 * * * *",
      "enabled": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastRun": "2024-01-01T00:05:00Z",
      "nextRun": "2024-01-01T00:10:00Z"
    }
  ],
  "total": 1,
  "active": 1
}
```

#### Get Job Details
```
GET /api/schedule/:jobId
```

#### Update Job
```
PUT /api/schedule/:jobId
Content-Type: application/json

{
  "enabled": false
}
```

#### Delete Job
```
DELETE /api/schedule/:jobId
```

#### Run Job Manually
```
POST /api/schedule/:jobId/run
```

## Redis Caching

The API uses Redis for caching price data to improve performance and reduce API calls.

### Cache Keys
- Format: `price:{token}:{network}:{timestamp}`
- TTL: Configurable via `REDIS_TTL` environment variable (default: 3600 seconds)

### Cache Middleware
- **cacheMiddleware**: Checks cache before processing request
- **setCacheMiddleware**: Stores successful responses in cache
- **priceCacheMiddleware**: Specialized middleware for price endpoints

## Alchemy SDK Integration

The API integrates with Alchemy SDK for fetching token prices.

### Supported Networks
- Ethereum Mainnet
- Polygon Mainnet
- Arbitrum Mainnet
- Optimism Mainnet
- Base Mainnet

### Features
- Token price fetching
- Network-specific configurations
- Error handling and fallbacks
- Mock data for development

## Job Scheduling

The API supports cron-based job scheduling for recurring price checks.

### Cron Expression Examples
- `0 */5 * * * *` - Every 5 minutes
- `0 0 * * * *` - Every hour
- `0 0 0 * * *` - Every day at midnight
- `0 0 0 * * 1` - Every Monday at midnight

### Job Management
- Create, read, update, delete jobs
- Enable/disable jobs
- Manual job execution
- Job history tracking

## Error Handling

The API provides comprehensive error handling:

### Error Response Format
```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/price"
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate job)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General**: 100 requests per 15 minutes per IP
- **Price endpoints**: 30 requests per minute per IP

## Security

The API includes several security measures:

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate limiting**: Prevent abuse
- **Input validation**: Sanitize user input
- **Error handling**: Prevent information leakage

## Logging

The API uses Winston for structured logging:

- **Development**: Console output with colors
- **Production**: File output with JSON format
- **Log levels**: error, warn, info, debug

## Development

### Project Structure
```
backend/
├── src/
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── index.ts        # Main application
├── logs/               # Log files
├── package.json
├── tsconfig.json
├── nodemon.json
└── .env
```

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Testing
You can test the API using tools like:
- **Postman**: Import the collection
- **curl**: Command-line testing
- **HTTPie**: User-friendly HTTP client

### Example curl commands:
```bash
# Get token price
curl -X POST http://localhost:3001/api/price \
  -H "Content-Type: application/json" \
  -d '{
    "token": "BTC",
    "network": "ethereum",
    "timestamp": "2024-01-01T00:00:00Z"
  }'

# Schedule job
curl -X POST http://localhost:3001/api/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "token": "BTC",
    "network": "ethereum",
    "interval": "0 */5 * * * *"
  }'

# Get scheduled jobs
curl http://localhost:3001/api/schedule
```

## Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use a proper Redis instance
3. Configure Alchemy API key
4. Set up proper logging
5. Use process manager (PM2, Docker)
6. Set up monitoring and alerts

### Docker Setup
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure code quality (lint, build)
5. Submit pull request

## License

MIT License - see LICENSE file for details.
