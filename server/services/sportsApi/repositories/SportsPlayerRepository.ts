import { sportsApiManager } from "../SportsApiManager";
import { cacheManager } from "../cache/CacheManager";
import { logger } from "../../../utils/logger";

const PLAYER_CACHE_PREFIX = "sports_player_";
const PLAYER_CACHE_TTL = 86400; // 24 hours

export class SportsPlayerRepository {
  async getPlayerById(id: string): Promise<any> {
    const cacheKey = `${PLAYER_CACHE_PREFIX}${id}`;
    const cached = await cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    logger.info(`[SportsPlayerRepository] Fetching fresh player details by ID: ${id}`);
    const player = await sportsApiManager.getPlayerById(id);
    await cacheManager.set(cacheKey, player, PLAYER_CACHE_TTL);
    return player;
  }
}

// Export single instance
export const sportsPlayerRepository = new SportsPlayerRepository();
