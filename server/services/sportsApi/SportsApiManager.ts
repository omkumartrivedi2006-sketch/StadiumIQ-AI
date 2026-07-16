import { SportsProviderInterface } from "./providers/SportsProviderInterface";
import { FootballDataOrgProvider } from "./providers/FootballDataOrgProvider";
import { ApiFootballProvider } from "./providers/ApiFootballProvider";
import { MockSportsProvider } from "./providers/MockSportsProvider";
import { logger } from "../../utils/logger";

export class SportsApiManager {
  private providers: SportsProviderInterface[] = [];
  private activeProviderIndex = 0;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    const fdKey = process.env.FOOTBALL_DATA_API_KEY;
    const afKey = process.env.API_FOOTBALL_KEY;

    // Load Football-Data.org if configured
    if (fdKey && fdKey.trim() !== "" && !fdKey.includes("placeholder")) {
      this.providers.push(new FootballDataOrgProvider(fdKey));
      logger.info("[SportsApiManager] Registered Football-Data.org API Provider");
    }

    // Load API-Football if configured
    if (afKey && afKey.trim() !== "" && !afKey.includes("placeholder")) {
      this.providers.push(new ApiFootballProvider(afKey));
      logger.info("[SportsApiManager] Registered API-Football API Provider");
    }

    // Always register MockSportsProvider as the ultimate fallback
    this.providers.push(new MockSportsProvider());
    logger.info("[SportsApiManager] Registered MockSportsProvider as ultimate fallback");

    // Start with the first available provider
    this.activeProviderIndex = 0;
    logger.info(`[SportsApiManager] Initial active provider: ${this.providers[this.activeProviderIndex].name}`);
  }

  private getActiveProvider(): SportsProviderInterface {
    if (this.providers.length === 0) {
      // Fallback safeguard
      return new MockSportsProvider();
    }
    return this.providers[this.activeProviderIndex];
  }

  private switchToBackup(error: Error) {
    const oldProvider = this.getActiveProvider().name;
    // Advance to next provider in the chain (wrapping around if needed, but not repeating endlessly)
    this.activeProviderIndex = (this.activeProviderIndex + 1) % this.providers.length;
    const newProvider = this.getActiveProvider().name;
    
    logger.warn(`[SportsApiManager] Provider "${oldProvider}" failed: ${error.message}. Switching to backup: "${newProvider}"`);
  }

  // Wrapper runner with automated failover logic
  private async executeWithFailover<T>(operation: (provider: SportsProviderInterface) => Promise<T>): Promise<T> {
    const startingIndex = this.activeProviderIndex;
    let attempts = 0;
    
    while (attempts < this.providers.length) {
      const provider = this.getActiveProvider();
      try {
        return await operation(provider);
      } catch (err: any) {
        attempts++;
        this.switchToBackup(err);
        
        // If we looped all the way back, throw the final error or break to use mock
        if (this.activeProviderIndex === startingIndex && attempts >= this.providers.length) {
          logger.error("[SportsApiManager] All registered sports API providers failed. Forcing Mock fallback.");
          // Force active provider to be MockSportsProvider (last one)
          this.activeProviderIndex = this.providers.findIndex(p => p instanceof MockSportsProvider);
          if (this.activeProviderIndex === -1) this.activeProviderIndex = 0;
          return await operation(this.getActiveProvider());
        }
      }
    }
    
    // Safeguard fallback call
    return await operation(new MockSportsProvider());
  }

  // Unified API Methods
  async getLiveMatches(): Promise<any[]> {
    return this.executeWithFailover(p => p.getLiveMatches());
  }

  async getUpcomingMatches(): Promise<any[]> {
    return this.executeWithFailover(p => p.getUpcomingMatches());
  }

  async getCompletedMatches(): Promise<any[]> {
    return this.executeWithFailover(p => p.getCompletedMatches());
  }

  async getMatchById(id: string): Promise<any> {
    return this.executeWithFailover(p => p.getMatchById(id));
  }

  async getMatchEvents(matchId: string): Promise<any[]> {
    return this.executeWithFailover(p => p.getMatchEvents(matchId));
  }

  async getMatchStatistics(matchId: string): Promise<any> {
    return this.executeWithFailover(p => p.getMatchStatistics(matchId));
  }

  async getTeams(): Promise<any[]> {
    return this.executeWithFailover(p => p.getTeams());
  }

  async getTeamById(id: string): Promise<any> {
    return this.executeWithFailover(p => p.getTeamById(id));
  }

  async getPlayerById(id: string): Promise<any> {
    return this.executeWithFailover(p => p.getPlayerById(id));
  }

  async getStandings(): Promise<any> {
    return this.executeWithFailover(p => p.getStandings());
  }
}

// Export single global instance
export const sportsApiManager = new SportsApiManager();
