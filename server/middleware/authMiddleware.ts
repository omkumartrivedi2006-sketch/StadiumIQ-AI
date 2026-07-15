import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = authService.verifyAccessToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
      code: "TOKEN_EXPIRED", // frontend can intercept this specifically
    });
    return;
  }

  req.user = {
    id: decoded.id,
    role: decoded.role,
  };
  next();
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permissions to access this resource.",
      });
      return;
    }

    next();
  };
};
