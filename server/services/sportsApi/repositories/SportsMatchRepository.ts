import { matchRepository } from "../../../repositories/matchRepository";
import { stadiumRepository } from "../../../repositories/stadiumRepository";
import { sportsApiManager } from "../SportsApiManager";
import { cacheManager } from "../cache/CacheManager";
import { logger } from "../../../utils/logger";
import { emitEvent } from "../../../utils/socket";

const MATCHES_CACHE_KEY = "sports_matches_all";
const MATCHES_CACHE_TTL = 15; // 15 seconds

export class SportsMatchRepository {
  // Sync live match data from API provider to Mongoose database
  private async syncMatchesToDb(apiMatches: any[]): Promise<any[]> {
    const syncedDocs: any[] = [];
    const stadiums = await stadiumRepository.find({}, { limit: 10 });
    const defaultStadium = stadiums.docs[0];

    for (const m of apiMatches) {
      try {
        // Resolve stadium document based on venue name or country
        let matchStadium = defaultStadium;
        if (m.venue?.name) {
          const found = stadiums.docs.find((s: any) => 
            s.name.toLowerCase().includes(m.venue.name.toLowerCase()) ||
            m.venue.name.toLowerCase().includes(s.name.toLowerCase())
          );
          if (found) matchStadium = found;
        }

        // Check if match already exists in database (matching home and away teams)
        let matchDoc = await matchRepository.findOne({ 
          homeTeam: m.homeTeam.name, 
          awayTeam: m.awayTeam.name 
        });

        const matchData = {
          stadiumId: matchStadium._id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          date: m.date ? new Date(m.date) : new Date(),
          kickoffTime: m.kickoffTime,
          status: m.status, // live, completed, scheduled
          seatAvailability: matchDoc?.seatAvailability ?? (m.status === "completed" ? 0 : 15000),
          weather: m.venue?.weather || "Clear, 72°F",
          attendance: m.homeTeam.attendance || m.attendance || 65000
        };

        if (matchDoc) {
          // Update existing match
          matchDoc = await matchRepository.update(matchDoc._id.toString(), matchData);
        } else {
          // Create new match
          matchDoc = await matchRepository.create(matchData);
        }

        // Merge live-only fields (score, minute, events) into the document object for response
        const docObj = matchDoc.toObject ? matchDoc.toObject() : { ...matchDoc };
        
        // Populate stadiumId details
        docObj.stadiumId = matchStadium;

        // Add dynamic live fields
        docObj.liveData = {
          score: {
            home: m.homeTeam.score,
            away: m.awayTeam.score,
            halfTime: { home: m.homeTeam.halfTimeScore, away: m.awayTeam.halfTimeScore },
            fullTime: { home: m.homeTeam.fullTimeScore, away: m.awayTeam.fullTimeScore }
          },
          minute: m.minute || 0,
          period: m.period || "NS",
          referee: m.referee || "Official Referee",
          possession: { home: m.homeTeam.possession || 50, away: m.awayTeam.possession || 50 },
          shots: { home: m.homeTeam.shots || 0, away: m.awayTeam.shots || 0 },
          shotsOnTarget: { home: m.homeTeam.shotsOnTarget || 0, away: m.awayTeam.shotsOnTarget || 0 },
          corners: { home: m.homeTeam.corners || 0, away: m.awayTeam.corners || 0 },
          yellowCards: { home: m.homeTeam.yellowCards || 0, away: m.awayTeam.yellowCards || 0 },
          redCards: { home: m.homeTeam.redCards || 0, away: m.awayTeam.redCards || 0 },
          fouls: { home: m.homeTeam.fouls || 0, away: m.awayTeam.fouls || 0 },
          offside: { home: m.homeTeam.offside || 0, away: m.awayTeam.offside || 0 }
        };

        // Standard flat home/away score properties for compatibility with existing UI
        docObj.homeScore = m.homeTeam.score;
        docObj.awayScore = m.awayTeam.score;
        docObj.minute = m.minute || 0;

        syncedDocs.push(docObj);
      } catch (err) {
        logger.error(`[SportsMatchRepository] Failed to sync match ${m.homeTeam?.name} vs ${m.awayTeam?.name}`, err);
      }
    }

    return syncedDocs;
  }

  // Get and sync all matches
  async getAllMatches(filterStatus?: string): Promise<any[]> {
    const cacheKey = `${MATCHES_CACHE_KEY}_${filterStatus || "all"}`;
    const cached = await cacheManager.get<any[]>(cacheKey);
    if (cached) return cached;

    logger.info(`[SportsMatchRepository] Loading fresh matches from API manager (filter: ${filterStatus || 'none'})`);
    let apiMatches: any[] = [];
    
    if (filterStatus === "live") {
      apiMatches = await sportsApiManager.getLiveMatches();
    } else if (filterStatus === "upcoming") {
      apiMatches = await sportsApiManager.getUpcomingMatches();
    } else if (filterStatus === "completed") {
      apiMatches = await sportsApiManager.getCompletedMatches();
    } else {
      const [live, upcoming, completed] = await Promise.all([
        sportsApiManager.getLiveMatches(),
        sportsApiManager.getUpcomingMatches(),
        sportsApiManager.getCompletedMatches()
      ]);
      apiMatches = [...live, ...upcoming, ...completed];
    }

    const synced = await this.syncMatchesToDb(apiMatches);
    await cacheManager.set(cacheKey, synced, MATCHES_CACHE_TTL);

    // Broadcast updates via Socket.IO
    try {
      emitEvent("match-update", synced);
    } catch (e) {
      logger.error("Failed to broadcast match-update event:", e);
    }

    return synced;
  }

  async getMatchById(id: string): Promise<any> {
    const cacheKey = `match_${id}`;
    const cached = await cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    // First find in MongoDB to get DB properties (like stadiumId, seats, etc.)
    let matchDoc: any = null;
    try {
      matchDoc = await matchRepository.findById(id, "stadiumId");
    } catch (e) {
      // If id is not a valid ObjectId, search by home/away teams or try fetching directly from API
      logger.warn(`[SportsMatchRepository] Match not found in DB with ID: ${id}. Attempting API search.`);
    }

    let apiMatch: any = null;
    if (matchDoc) {
      // Find in live API matching by home/away teams
      const liveMatches = await sportsApiManager.getLiveMatches();
      const upcomingMatches = await sportsApiManager.getUpcomingMatches();
      const completedMatches = await sportsApiManager.getCompletedMatches();
      const allApi = [...liveMatches, ...upcomingMatches, ...completedMatches];

      apiMatch = allApi.find(m => 
        m.homeTeam.name.toLowerCase() === matchDoc.homeTeam.toLowerCase() && 
        m.awayTeam.name.toLowerCase() === matchDoc.awayTeam.toLowerCase()
      );
    }

    if (!apiMatch) {
      // Fallback directly to fetching by ID from API manager
      try {
        apiMatch = await sportsApiManager.getMatchById(id);
      } catch (err) {
        logger.error(`[SportsMatchRepository] Failed to get match from API manager by ID: ${id}`, err);
      }
    }

    if (!apiMatch && !matchDoc) return null;

    // Merge DB document with API data
    const stadium = matchDoc?.stadiumId || (apiMatch ? { name: apiMatch.venue.name, city: apiMatch.venue.city, country: apiMatch.venue.country } : null);
    
    const merged = {
      _id: matchDoc?._id?.toString() || id,
      stadiumId: stadium,
      homeTeam: matchDoc?.homeTeam || apiMatch?.homeTeam?.name,
      awayTeam: matchDoc?.awayTeam || apiMatch?.awayTeam?.name,
      date: matchDoc?.date || apiMatch?.date,
      kickoffTime: matchDoc?.kickoffTime || apiMatch?.kickoffTime,
      status: apiMatch?.status || matchDoc?.status || "scheduled",
      seatAvailability: matchDoc?.seatAvailability ?? 12000,
      attendance: apiMatch?.homeTeam?.attendance || matchDoc?.attendance || 60000,
      weather: apiMatch?.venue?.weather || matchDoc?.weather || "Clear, 72°F",
      liveData: apiMatch ? {
        score: {
          home: apiMatch.homeTeam.score,
          away: apiMatch.awayTeam.score,
          halfTime: { home: apiMatch.homeTeam.halfTimeScore, away: apiMatch.awayTeam.halfTimeScore },
          fullTime: { home: apiMatch.homeTeam.fullTimeScore, away: apiMatch.awayTeam.fullTimeScore }
        },
        minute: apiMatch.minute || 0,
        period: apiMatch.period || "NS",
        referee: apiMatch.referee || "Official Referee",
        possession: { home: apiMatch.homeTeam.possession || 50, away: apiMatch.awayTeam.possession || 50 },
        shots: { home: apiMatch.homeTeam.shots || 0, away: apiMatch.awayTeam.shots || 0 },
        shotsOnTarget: { home: apiMatch.homeTeam.shotsOnTarget || 0, away: apiMatch.awayTeam.shotsOnTarget || 0 },
        corners: { home: apiMatch.homeTeam.corners || 0, away: apiMatch.awayTeam.corners || 0 },
        yellowCards: { home: apiMatch.homeTeam.yellowCards || 0, away: apiMatch.awayTeam.yellowCards || 0 },
        redCards: { home: apiMatch.homeTeam.redCards || 0, away: apiMatch.awayTeam.redCards || 0 },
        fouls: { home: apiMatch.homeTeam.fouls || 0, away: apiMatch.awayTeam.fouls || 0 },
        offside: { home: apiMatch.homeTeam.offside || 0, away: apiMatch.awayTeam.offside || 0 }
      } : null,
      homeScore: apiMatch?.homeTeam?.score,
      awayScore: apiMatch?.awayTeam?.score,
      minute: apiMatch?.minute || 0,
      events: apiMatch?.events || []
    };

    await cacheManager.set(cacheKey, merged, MATCHES_CACHE_TTL);
    return merged;
  }

  async getMatchEvents(matchId: string): Promise<any[]> {
    const cacheKey = `match_events_${matchId}`;
    const cached = await cacheManager.get<any[]>(cacheKey);
    if (cached) return cached;

    // Check if match exists in DB to resolve names
    let apiMatchId = matchId;
    try {
      const matchDoc = await matchRepository.findById(matchId);
      if (matchDoc) {
        // Find live/upcoming/completed matches to map to the API ID
        const live = await sportsApiManager.getLiveMatches();
        const upcoming = await sportsApiManager.getUpcomingMatches();
        const completed = await sportsApiManager.getCompletedMatches();
        const apiMatch = [...live, ...upcoming, ...completed].find(m => 
          m.homeTeam.name.toLowerCase() === matchDoc.homeTeam.toLowerCase() &&
          m.awayTeam.name.toLowerCase() === matchDoc.awayTeam.toLowerCase()
        );
        if (apiMatch) apiMatchId = apiMatch.id;
      }
    } catch (e) {}

    const events = await sportsApiManager.getMatchEvents(apiMatchId);
    await cacheManager.set(cacheKey, events, MATCHES_CACHE_TTL);
    return events;
  }

  async getMatchStatistics(matchId: string): Promise<any> {
    const cacheKey = `match_stats_${matchId}`;
    const cached = await cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    let apiMatchId = matchId;
    try {
      const matchDoc = await matchRepository.findById(matchId);
      if (matchDoc) {
        const live = await sportsApiManager.getLiveMatches();
        const upcoming = await sportsApiManager.getUpcomingMatches();
        const completed = await sportsApiManager.getCompletedMatches();
        const apiMatch = [...live, ...upcoming, ...completed].find(m => 
          m.homeTeam.name.toLowerCase() === matchDoc.homeTeam.toLowerCase() &&
          m.awayTeam.name.toLowerCase() === matchDoc.awayTeam.toLowerCase()
        );
        if (apiMatch) apiMatchId = apiMatch.id;
      }
    } catch (e) {}

    const stats = await sportsApiManager.getMatchStatistics(apiMatchId);
    await cacheManager.set(cacheKey, stats, MATCHES_CACHE_TTL);
    return stats;
  }
}

// Export single instance
export const sportsMatchRepository = new SportsMatchRepository();
