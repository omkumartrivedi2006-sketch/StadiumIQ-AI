import rateLimit from "express-rate-limit";
import { apiResponse } from "../utils/apiResponse";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
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
