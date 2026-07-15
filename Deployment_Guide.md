# StadiumIQ AI - Production Deployment Guide

StadiumIQ AI can be deployed either as a **Unified Single Host** (where the Express backend serves the compiled React static files) or as a **Split Architecture** (React SPA on Vercel, Node/Express API on Render/Railway). 

This guide details both approaches.

---

## 1. Cloud Database Setup (MongoDB Atlas)

Before deploying your servers, you must set up your production database.

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and register for a free account.
2. Deploy a new database using the **M0 Free** tier.
3. Under **Database Access**, create a user (e.g. `prodUser`) and generate a secure password.
4. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) so that cloud hosts like Render/Vercel can connect to the database.
5. Go to the Database Deployment tab, click **Connect** -> **Drivers**, and copy the connection string.
6. Replace `<db_password>` with your user's password and append `/stadium_iq` before the query parameters to set your database name:
   ```text
   mongodb+srv://prodUser:yourPassword@cluster0.xxxx.mongodb.net/stadium_iq?retryWrites=true&w=majority
   ```

---

## 2. Option A: Unified Deployment (Recommended & Simplest)

In this setup, you run a single Node.js service that hosts the Express backend API and automatically serves the pre-built React frontend static pages from `dist/public`.

### Render Deployment Steps
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`StadiumI-AI`).
4. Configure the Web Service settings:
   * **Language**: `Node`
   * **Build Command**: `pnpm install && pnpm run build`
   * **Start Command**: `node dist/index.js`
   * **Instance Type**: `Free`
5. Go to the **Environment** tab and add the variables listed in the Environment Variables section below.
6. Click **Deploy Web Service**. Render will build the React bundle, compile the Node server, and start the app on a single public URL.

### Railway Deployment Steps
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Add the required environment variables in the **Variables** tab.
5. Railway will automatically detect the Node environment, run the build script, and deploy the service.

---

## 3. Option B: Split Architecture (Vercel + Render)

In this setup, the frontend React app is hosted on Vercel's global edge network, and the backend Express API is hosted on Render.

### Backend (Render/Railway)
1. Follow the same Render steps as Option A.
2. In the Environment variables, ensure you set `CLIENT_URL` to your Vercel frontend URL to allow CORS.

### Frontend (Vercel)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and import your repository.
3. In the project setup configuration:
   * **Root Directory**: Select `client` folder.
   * **Framework Preset**: `Vite`
   * **Build Command**: `vite build`
   * **Output Directory**: `dist`
4. Add the following **Environment Variables**:
   * `VITE_SERVER_URL` = Your backend server Render URL (e.g. `https://stadium-api.onrender.com/api`)
5. Deploy. Vercel will build the React application and host it.

---

## 4. Production Environment Variables Checklist

Ensure these variables are set in your cloud provider's dashboard:

| Variable | Description | Example Production Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode of operation | `production` |
| `PORT` | Server listen port | `3000` (Render/Railway sets this automatically) |
| `CLIENT_URL` | Frontend client origin (CORS) | `https://stadium-iq.vercel.app` (If split) or your unified domain |
| `SERVER_URL` | Server backend domain | `https://stadium-api.onrender.com` |
| `MONGODB_URI` | Production MongoDB Atlas URI | `mongodb+srv://prodUser:pass@cluster.mongodb.net/stadium_iq` |
| `JWT_SECRET` | Secret key to sign access tokens | *Use a long cryptographically secure random string* |
| `JWT_REFRESH_SECRET`| Secret key to sign refresh tokens| *Use a long cryptographically secure random string* |
| `COOKIE_SECRET` | Secret to sign cookies | *Use a secure random string* |
| `SESSION_SECRET` | Secret to sign sessions | *Use a secure random string* |
| `GEMINI_API_KEY` | Google Gemini AI credential | *Your Gemini API Key* |
| `AI_MODEL` | Google Gemini target model | `gemini-2.5-flash` |
| `SMTP_HOST` | E-mail SMTP host server | `smtp.gmail.com` or `smtp.sendgrid.net` |
| `SMTP_PORT` | E-mail SMTP port | `587` |
| `SMTP_USER` | E-mail SMTP credential user | `your-sender-email@gmail.com` |
| `SMTP_PASSWORD` | E-mail SMTP credential password | `your-16-character-app-password` |
