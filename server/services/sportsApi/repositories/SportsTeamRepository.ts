import { sportsApiManager } from "../SportsApiManager";
import { cacheManager } from "../cache/CacheManager";
import { logger } from "../../../utils/logger";

const TEAMS_CACHE_KEY = "sports_teams_all";
const TEAM_DETAIL_CACHE_PREFIX = "sports_team_";
const TEAMS_CACHE_TTL = 86400; // 24 hours

export class SportsTeamRepository {
  async getTeams(): Promise<any[]> {
    const cached = await cacheManager.get<any[]>(TEAMS_CACHE_KEY);
    if (cached) return cached;

    logger.info("[SportsTeamRepository] Fetching fresh teams from API manager");
    const teams = await sportsApiManager.getTeams();
    await cacheManager.set(TEAMS_CACHE_KEY, teams, TEAMS_CACHE_TTL);
    return teams;
  }

  async getTeamById(id: string): Promise<any> {
    const cacheKey = `${TEAM_DETAIL_CACHE_PREFIX}${id}`;
    const cached = await cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    logger.info(`[SportsTeamRepository] Fetching fresh team details by ID: ${id}`);
    const team = await sportsApiManager.getTeamById(id);
    await cacheManager.set(cacheKey, team, TEAMS_CACHE_TTL);
    return team;
  }
}

// Export single instance
export const sportsTeamRepository = new SportsTeamRepository();
