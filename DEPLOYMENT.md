# 🚀 Deployment Guide

This guide will help you deploy the Token Price Oracle to production using Vercel (frontend) and Render (backend).

## 📋 Prerequisites

Before deploying, make sure you have:
- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)
- Redis Cloud account (optional, free)

## 🎯 Step 1: Push to GitHub

1. **Create a new repository on GitHub**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `token-price-oracle`
   - Make it public
   - Don't initialize with README (we already have one)

2. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/token-price-oracle.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Service
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `token-price-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2.2 Set Environment Variables
Add these environment variables in Render:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/token-price-db
ALCHEMY_API_KEY=your_alchemy_api_key_here
REDIS_URL=redis://username:password@host:port (optional)
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### 2.3 Get Your Backend URL
After deployment, you'll get a URL like:
`https://token-price-api.onrender.com`

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`

### 3.2 Set Environment Variables
Add this environment variable in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

### 3.3 Deploy
Click "Deploy" and wait for the build to complete.

## 🗄️ Step 4: Set Up MongoDB Atlas

### 4.1 Create Database
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Whitelist IP addresses (0.0.0.0/0 for all IPs)

### 4.2 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Add this to your Render environment variables

## ⚡ Step 5: Set Up Redis (Optional)

### 5.1 Create Redis Instance
1. Go to [redis.com](https://redis.com)
2. Create a free account
3. Create a new database (free tier)
4. Get the connection URL
5. Add to Render environment variables

## 🔧 Step 6: Configure CORS

Update your backend environment variables to include your frontend domain:

```env
CORS_ORIGINS=https://your-app-name.vercel.app,https://your-custom-domain.com
```

## ✅ Step 7: Test Deployment

1. **Test Backend**:
   - Visit `https://your-backend-url.onrender.com/api/health`
   - Should return a health check response

2. **Test Frontend**:
   - Visit your Vercel URL
   - Try fetching a price (ETH on Ethereum)
   - Check browser console for any errors

## 🚀 Step 8: Custom Domains (Optional)

### Frontend (Vercel)
1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Backend (Render)
1. Go to your Render service settings
2. Click "Custom Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## 🔄 Step 9: Automatic Deployments

Both Vercel and Render will automatically deploy when you push to your main branch:

```bash
# Make changes to your code
git add .
git commit -m "Update: your changes"
git push origin main
```

## 📊 Monitoring

### Vercel
- View deployment logs in Vercel dashboard
- Monitor performance and analytics

### Render
- View service logs in Render dashboard
- Monitor resource usage and uptime

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Connection Issues**:
   - Verify CORS settings
   - Check environment variables
   - Ensure backend URL is correct

3. **Database Connection**:
   - Verify MongoDB connection string
   - Check IP whitelist settings
   - Ensure database user has correct permissions

### Logs
- **Vercel**: Check Functions tab for API logs
- **Render**: Check Logs tab for service logs

## 🎉 Success!

Your Token Price Oracle is now live! 

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-api.onrender.com`

Share your deployment URLs and start querying crypto prices! 🚀