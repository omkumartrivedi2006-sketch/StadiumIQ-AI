import { logger } from "../../../utils/logger";

interface CacheItem {
  data: any;
  expiry: number;
}

export class CacheManager {
  private inMemoryStore = new Map<string, CacheItem>();
  private redisClient: any = null;
  private useRedis = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        // Attempt to import redis or ioredis dynamically
        // Since it may not be in package.json, we catch the import failure
        // @ts-ignore
        const redisModule = await import("redis");
        this.redisClient = redisModule.createClient({ url: redisUrl });

        await this.redisClient.connect();
        this.useRedis = true;
        logger.info("[CacheManager] Successfully connected to Redis server");
      } catch (err: any) {
        logger.warn(`[CacheManager] Redis URL is configured but connection failed (probably 'redis' client package not installed). Falling back to In-Memory cache. Error: ${err.message}`);
        this.useRedis = false;
      }
    } else {
      logger.info("[CacheManager] No REDIS_URL configured. Operating in In-Memory cache mode.");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useRedis && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        if (val) {
          return JSON.parse(val) as T;
        }
        return null;
      } catch (err) {
        logger.error("[CacheManager] Redis GET error, falling back to in-memory store", err);
      }
    }

    // In-memory fallback
    const item = this.inMemoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return item.data as T;
  }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(data), {
          EX: ttlSeconds
        });
        return;
      } catch (err) {
        logger.error("[CacheManager] Redis SET error, falling back to in-memory store", err);
      }
    }

    // In-memory fallback
    this.inMemoryStore.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }

  async delete(key: string): Promise<void> {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.del(key);
        return;
      } catch (err) {
        logger.error("[CacheManager] Redis DEL error", err);
      }
    }
    this.inMemoryStore.delete(key);
  }

  async clear(): Promise<void> {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.flushAll();
        return;
      } catch (err) {
        logger.error("[CacheManager] Redis flushAll error", err);
      }
    }
    this.inMemoryStore.clear();
  }
}

// Export single global instance
export const cacheManager = new CacheManager();
