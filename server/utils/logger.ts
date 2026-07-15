import dotenv from "dotenv";
dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = levels[LOG_LEVEL as keyof typeof levels] ?? levels.info;

export const logger = {
  error(message: string, meta?: any) {
    if (currentLevel >= levels.error) {
      console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, meta !== undefined ? meta : "");
    }
  },
  warn(message: string, meta?: any) {
    if (currentLevel >= levels.warn) {
      console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta !== undefined ? meta : "");
    }
  },
  info(message: string, meta?: any) {
    if (currentLevel >= levels.info) {
      console.log(`[INFO] [${new Date().toISOString()}] ${message}`, meta !== undefined ? meta : "");
    }
  },
  debug(message: string, meta?: any) {
    if (currentLevel >= levels.debug) {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${message}`, meta !== undefined ? meta : "");
    }
  },
};
