import rateLimit from "express-rate-limit";
import { apiResponse } from "../utils/apiResponse";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // Limit requests per IP (generous in development)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    apiResponse.error(
      res,
      "Too many requests from this IP, please try again after 15 minutes.",
      [],
      429
    );
  },
});
