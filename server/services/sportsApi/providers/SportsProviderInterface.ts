export interface SportsProviderInterface {
  name: string;
  getLiveMatches(): Promise<any[]>;
  getUpcomingMatches(): Promise<any[]>;
  getCompletedMatches(): Promise<any[]>;
  getMatchById(id: string): Promise<any>;
  getMatchEvents(matchId: string): Promise<any[]>;
  getMatchStatistics(matchId: string): Promise<any>;
  getTeams(): Promise<any[]>;
  getTeamById(id: string): Promise<any>;
  getPlayerById(id: string): Promise<any>;
  getStandings(): Promise<any>;
}
