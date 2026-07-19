import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { logger } from "./utils/logger";

// Centralized process exception logging
process.on("uncaughtException", (error) => {
  logger.error("CRITICAL: Uncaught Exception detected:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("CRITICAL: Unhandled Promise Rejection detected:", { reason, promise });
});

import { connectDB } from "./config/db";
import { apiLimiter } from "./middleware/rateLimiter";
import { handle404, handleGlobalError } from "./middleware/errorMiddleware";
import { initSocket } from "./utils/socket";

// Route imports
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import stadiumRoutes from "./routes/stadiumRoutes";
import matchRoutes from "./routes/matchRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import foodRoutes from "./routes/foodRoutes";
import transportRoutes from "./routes/transportRoutes";
import sosRoutes from "./routes/sosRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import chatRoutes from "./routes/chatRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import lostFoundRoutes from "./routes/lostFoundRoutes";
import aiRoutes from "./routes/aiRoutes";
import searchRoutes from "./routes/searchRoutes";
import sportsRoutes from "./routes/sportsRoutes";
import locationRoutes from "./routes/locationRoutes";
import mapRoutes from "./routes/mapRoutes";
import incidentRoutes from "./routes/incidentRoutes";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  initSocket(server);

  // Standard Production Middlewares
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://forge.butterfly-effect.dev"],
        connectSrc: ["'self'", "https://maps.googleapis.com", "https://forge.butterfly-effect.dev", "wss://*", "ws://*"],
        imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "https://maps.googleapis.com", "https://forge.butterfly-effect.dev", "https://*.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      }
    } : false,
  }));
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }));
  app.use(compression());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(cookieParser(process.env.COOKIE_SECRET || "fallback_cookie_secret"));

  // Apply Rate Limiting to API requests
  app.use("/api", apiLimiter);

  // Mount API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/stadiums", stadiumRoutes);
  app.use("/api/matches", matchRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/food", foodRoutes);
  app.use("/api/transport", transportRoutes);
  app.use("/api/sos", sosRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/admin", analyticsRoutes);
  app.use("/api/lost-found", lostFoundRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/location", locationRoutes);
  app.use("/api/map", mapRoutes);
  app.use("/api/incidents", incidentRoutes);
  app.use("/api", sportsRoutes);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (req, res, next) => {
    // If request is under /api, forward to 404 handler instead of serving index.html
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // 404 and Global Error Handling
  app.use(handle404);
  app.use(handleGlobalError);

  // Run backend on 5000 in local dev to allow Vite proxy, or 3000 (or PORT env) in production
  const port =
    process.env.NODE_ENV === "production"
      ? (process.env.PORT || 3000)
      : 5000;

  // Connect Database before starting server
  await connectDB();

  server.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
