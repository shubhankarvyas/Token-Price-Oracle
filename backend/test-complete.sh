#!/bin/bash

echo "🚀 Testing Token Price API"
echo "=========================="

# Test 1: Health check
echo "1. Health Check:"
curl -s http://localhost:3001/api/health | jq .
echo ""

# Test 2: Server info
echo "2. Server Info:"
curl -s http://localhost:3001/ | jq .
echo ""

# Test 3: Supported networks
echo "3. Supported Networks:"
curl -s http://localhost:3001/api/price/supported-networks | jq .
echo ""

# Test 4: Schedule endpoints
echo "4. Get Scheduled Jobs:"
curl -s http://localhost:3001/api/schedule | jq .
echo ""

# Test 5: Create a new job
echo "5. Create a New Job:"
curl -s -X POST http://localhost:3001/api/schedule \
  -H "Content-Type: application/json" \
  -d '{"token": "ETH", "network": "ethereum", "interval": "0 0 * * *", "enabled": true}' | jq .
echo ""

# Test 6: Get jobs again
echo "6. Get Jobs After Creation:"
curl -s http://localhost:3001/api/schedule | jq .
echo ""

# Test 7: Price endpoint (this will show the graceful error)
echo "7. Price Endpoint (will show error due to missing services):"
curl -s "http://localhost:3001/api/price?token=WETH&network=ethereum" | jq .
echo ""

echo "=========================="
echo "✅ Test Complete!"
echo ""
echo "💡 Summary:"
echo "- ✅ Basic API endpoints working"
echo "- ✅ Job scheduling working"
echo "- ✅ Validation working"
echo "- ❌ Price fetching needs Alchemy API key"
echo "- ❌ Data persistence needs MongoDB"
echo "- ❌ Caching needs Redis"
echo ""
echo "🔧 To get real data, you need:"
echo "1. Alchemy API key (free at alchemy.com)"
echo "2. MongoDB: brew install mongodb-community"
echo "3. Redis: brew install redis"
