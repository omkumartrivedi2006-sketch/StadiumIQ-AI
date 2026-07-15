# Installation & Local Setup Guide 🛠️

Follow these step-by-step instructions to install dependencies and run StadiumIQ AI locally.

---

## 1. Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or above recommended)
- **pnpm** (or npm/yarn)
- **MongoDB** (Optional; the system falls back to a Pure In-Memory Mock Repository if local MongoDB is unavailable, enabling instant testing without complex database configuration).

---

## 2. Configuration & Env Files

Create a `.env` file in the root directory (based on the provided `.env.example` template):

```bash
# Server Port Configuration
PORT=5000
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/stadium_iq

# Authentication Key Tokens
JWT_SECRET=super_secret_access_token_key_123
JWT_REFRESH_SECRET=super_secret_refresh_token_key_456
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_SECRET=cookie_signing_secret_789

# AI Assistant Settings
GEMINI_API_KEY=your-gemini-key-here
AI_MODEL=gemini-2.5-flash
AI_TEMPERATURE=0.7

# Google Maps API Key Proxy
GOOGLE_MAPS_API_KEY=your-maps-key-here
```

---

## 3. Dependency Installation

To install all dependencies (Vite client, Node/Express server, WebSockets, and UI components):

```bash
pnpm install
```

---

## 4. Run StadiumIQ AI Locally

You will need to run the client and the backend server in parallel.

### Launch Express & WebSocket Server:
```bash
pnpm run dev:server
```
*The server will boot on `http://localhost:5000/`. It automatically connects to your local MongoDB or initializes the in-memory fallback. It also runs default database seeders for match schedules, stadium details, and food stalls.*

### Launch Vite Dev Client:
```bash
pnpm run dev
```
*The Vite application runs on `http://localhost:3000/`. It uses a development proxy to pipe API requests directly to the port 5000 backend.*

---

## 5. Local Verification Tasks

1. **Authentication**: Navigate to `http://localhost:3000/register` to create a new user. Verify you can register, log in, and view your role dashboard.
2. **Interactive Map**: Open `/dashboard` to load the Google Map. Use the sidebar buttons to plot markers and view walking paths.
3. **AI Chat**: Visit the `/chat` tab and interact with the AI assistant.
4. **Real-time SOS**: Navigate to `/emergency` and trigger an SOS help request. Verify a notification appears immediately on volunteer and organizer pages.
