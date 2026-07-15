# Deployment Guide 🚀

This document covers how to build, package, and deploy StadiumIQ AI to cloud providers for production.

---

## 1. MongoDB Atlas Configuration (Database)

1. Create a free database cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, whitelist access from `0.0.0.0/0` (or add individual IP blocks of your cloud hosts).
3. Create a database user and copy the MongoDB connection string.
4. Set the `MONGODB_URI` environment variable on your backend server to this string.

---

## 2. Server Deployment (Render / Railway)

Express and Socket.IO require a persistent server container. You can deploy it to **Render** or **Railway**:

1. Link your GitHub repository.
2. Configure a Web Service.
3. Set the following environment variables:
   - `NODE_ENV=production`
   - `PORT=3000` (or leave default for cloud injection)
   - `MONGODB_URI=mongodb+srv://...` (Atlas Connection)
   - `JWT_SECRET=production-secure-jwt-key`
   - `JWT_REFRESH_SECRET=production-secure-refresh-key`
   - `COOKIE_SECRET=production-secure-cookie-key`
   - `GEMINI_API_KEY=your-actual-api-key`
   - `CLIENT_URL=https://your-frontend-vercel-url.vercel.app`
4. Set the Build Command:
   ```bash
   pnpm install && pnpm run build
   ```
5. Set the Start Command:
   ```bash
   pnpm run start
   ```

---

## 3. Frontend Deployment (Vercel / Netlify)

Vercel is optimal for serving pre-built Vite static assets:

1. Import your repository into **Vercel**.
2. Configure settings:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist/public`
3. Add the following frontend environment variables:
   - `VITE_FRONTEND_FORGE_API_KEY=key`
   - `VITE_FRONTEND_FORGE_API_URL=url`
   - `VITE_ANALYTICS_ENDPOINT=endpoint`
   - `VITE_ANALYTICS_WEBSITE_ID=id`
4. To route API endpoints to your deployed Express backend, create a `vercel.json` file in the `client/` subdirectory:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-backend-render-url.onrender.com/api/:path*"
       }
     ]
   }
   ```
