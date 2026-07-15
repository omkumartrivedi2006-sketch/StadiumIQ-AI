import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_access_token_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_token_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export const authService = {
  generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ id: userId, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });
  },

  generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
    });
  },

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  },

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (e) {
      return null;
    }
  },

  async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  },
};
