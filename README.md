# 🚀 Token Price Oracle

A modern web application for querying real-time and historical cryptocurrency token prices across multiple blockchain networks.

![Token Price Oracle](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-13.5.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ Features

- **Real-time Price Data**: Get current market prices for popular cryptocurrencies
- **Historical Price Queries**: Query prices for specific dates and times
- **Multi-Network Support**: Ethereum, Polygon, Arbitrum, Optimism
- **Background Job Scheduling**: Automated historical data collection
- **Modern UI**: Glassmorphism design with responsive layout
- **API Integration**: CoinGecko API for real price data
- **Database Storage**: MongoDB for historical price caching

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 13.5.1 with App Router
- **Styling**: Tailwind CSS with custom dark theme
- **Components**: shadcn/ui component library
- **State Management**: Zustand for client state
- **Deployment**: Vercel (Static Export)

### Backend (Node.js)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB for price data storage
- **Cache**: Redis for session management
- **Jobs**: BullMQ for background processing
- **APIs**: CoinGecko for real-time price data
- **Deployment**: Render

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database
- Redis instance (optional, for job scheduling)

### Frontend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `out`
4. Deploy automatically on push

### Backend (Render)
1. Connect your GitHub repository to Render
2. Select the `backend` folder as root directory
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables

## 📊 Supported Tokens

- **BTC** (Bitcoin)
- **ETH** (Ethereum)
- **USDC** (USD Coin)
- **USDT** (Tether)
- **MATIC** (Polygon)
- **LINK** (Chainlink)
- **UNI** (Uniswap)
- **AAVE** (Aave)
- **COMP** (Compound)
- **MKR** (Maker)

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Backend (.env)
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
ALCHEMY_API_KEY=your_alchemy_api_key
REDIS_URL=your_redis_url (optional)
```

## 📱 Usage

1. **Current Price**: Enter token symbol and network, leave timestamp empty
2. **Historical Price**: Enter token symbol, network, and select a specific date/time
3. **Schedule Jobs**: Create background jobs to fetch complete historical data
4. **View Jobs**: Monitor scheduled jobs and their progress

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Zustand
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB, Redis
- **APIs**: CoinGecko, Alchemy SDK
- **Deployment**: Vercel + Render
- **Tools**: ESLint, Prettier, Git

## 📈 Performance

- **Static Export**: Optimized for CDN delivery
- **API Caching**: Redis-based caching for faster responses
- **Background Jobs**: Efficient historical data collection
- **Responsive Design**: Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live Demo**: [[Your Vercel URL](https://token-price-oracle-pied.vercel.app/)]
- **API Documentation**: [[Your Backend URL](https://token-price-api-d3n4.onrender.com)]/api
- **GitHub**: [[Your GitHub Repository](https://github.com/shubhankarvyas/Token-Price-Oracle)]

---

Built with ❤️ for the crypto community