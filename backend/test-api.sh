#!/bin/bash

# Test script for Token Price API without external dependencies

echo "🚀 Starting Token Price API Test..."
echo "=================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one first."
    exit 1
fi

echo "✅ .env file found"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

echo "✅ Build successful"

# Start the server in background
echo "🌟 Starting server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test endpoints
echo "🧪 Testing API endpoints..."
echo "=================================="

# Test 1: Health check
echo "Test 1: Health check"
curl -s http://localhost:3001/api/health | jq . || echo "Health endpoint response"
echo ""

# Test 2: Server info
echo "Test 2: Server info"
curl -s http://localhost:3001/ | jq . || echo "Server info response"
echo ""

# Test 3: Price endpoint (will show graceful error)
echo "Test 3: Price endpoint"
curl -s "http://localhost:3001/api/price?token=WETH&network=ethereum" | jq . || echo "Price endpoint response"
echo ""

# Test 4: Supported networks
echo "Test 4: Supported networks"
curl -s http://localhost:3001/api/price/supported-networks | jq . || echo "Supported networks response"
echo ""

# Test 5: Schedule endpoints
echo "Test 5: Get scheduled jobs"
curl -s http://localhost:3001/api/schedule | jq . || echo "Schedule endpoint response"
echo ""

echo "=================================="
echo "✅ Test completed!"
echo "Server is running on http://localhost:3001"
echo "Kill the server with: kill $SERVER_PID"
echo ""
echo "To get real data, you'll need:"
echo "1. Alchemy API key (free at alchemy.com)"
echo "2. Local MongoDB: brew install mongodb-community"
echo "3. Local Redis: brew install redis"
echo ""
echo "Check SETUP_GUIDE.md for detailed instructions"
