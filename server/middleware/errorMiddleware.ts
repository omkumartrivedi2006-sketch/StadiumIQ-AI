import { Request, Response, NextFunction } from "express";
import { apiResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const handle404 = (req: Request, res: Response, next: NextFunction): void => {
  apiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, [], 404);
};

export const handleGlobalError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error("Unhandled Global Error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  apiResponse.error(
    res,
    message,
    process.env.NODE_ENV === "development" ? [err.stack] : [],
    status
  );
};
