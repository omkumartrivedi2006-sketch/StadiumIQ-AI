import axios from "axios";
import { SportsProviderInterface } from "./SportsProviderInterface";

export class ApiFootballProvider implements SportsProviderInterface {
  name = "ApiFootballProvider";
  private apiKey: string;
  private baseUrl = "https://api-football-v1.p.rapidapi.com/v3";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      "x-rapidapi-key": this.apiKey,
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com"
    };
  }

  private validateKey() {
    if (!this.apiKey || this.apiKey.includes("placeholder") || this.apiKey.trim() === "") {
      throw new Error("Invalid or placeholder API-Football API key provided");
    }
  }

  private mapFixture(f: any): any {
    const fixture = f.fixture;
    const teams = f.teams;
    const goals = f.goals;

    return {
      id: fixture.id.toString(),
      competition: f.league?.name || "International Match",
      status: fixture.status?.short?.toLowerCase() === "live" || fixture.status?.short?.toLowerCase() === "1h" || fixture.status?.short?.toLowerCase() === "2h" ? "live" : 
              fixture.status?.short?.toLowerCase() === "ft" ? "completed" : "scheduled",
      minute: fixture.status?.elapsed || 0,
      period: fixture.status?.short || "NS",
      kickoffTime: fixture.date ? new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "8:00 PM",
      referee: fixture.referee || "Official Referee",
      venue: {
        name: fixture.venue?.name || "Stadium",
        city: fixture.venue?.city || "",
        country: f.league?.country || ""
      },
      homeTeam: {
        id: teams.home?.id?.toString() || "home",
        name: teams.home?.name || "Home Team",
        logo: teams.home?.logo || "",
        score: goals.home !== undefined ? goals.home : null,
        halfTimeScore: f.score?.halftime?.home !== undefined ? f.score.halftime.home : null,
        fullTimeScore: f.score?.fulltime?.home !== undefined ? f.score.fulltime.home : null,
        possession: 50,
        shots: 10,
        shotsOnTarget: 4,
        corners: 4,
        yellowCards: 0,
        redCards: 0,
        fouls: 10,
        offside: 1
      },
      awayTeam: {
        id: teams.away?.id?.toString() || "away",
        name: teams.away?.name || "Away Team",
        logo: teams.away?.logo || "",
        score: goals.away !== undefined ? goals.away : null,
        halfTimeScore: f.score?.halftime?.away !== undefined ? f.score.halftime.away : null,
        fullTimeScore: f.score?.fulltime?.away !== undefined ? f.score.fulltime.away : null,
        possession: 50,
        shots: 10,
        shotsOnTarget: 4,
        corners: 4,
        yellowCards: 0,
        redCards: 0,
        fouls: 10,
        offside: 1
      },
      events: []
    };
  }

  async getLiveMatches(): Promise<any[]> {
    this.validateKey();
    try {
      const response = await axios.get(`${this.baseUrl}/fixtures?live=all`, { headers: this.getHeaders(), timeout: 10000 });
      return (response.data?.response || []).map((f: any) => this.mapFixture(f));
    } catch (e: any) {
      throw new Error(`API-Football getLiveMatches failed: ${e.message}`);
    }
  }

  async getUpcomingMatches(): Promise<any[]> {
    this.validateKey();
    try {
      // Fetch international league (league 1 is FIFA World Cup, or 2 for Champions League)
      const response = await axios.get(`${this.baseUrl}/fixtures?league=1&season=2026`, { headers: this.getHeaders(), timeout: 10000 });
      const fixtures = response.data?.response || [];
      return fixtures.filter((f: any) => f.fixture?.status?.short === "NS").slice(0, 10).map((f: any) => this.mapFixture(f));
    } catch (e: any) {
      throw new Error(`API-Football getUpcomingMatches failed: ${e.message}`);
    }
  }

  async getCompletedMatches(): Promise<any[]> {
    this.validateKey();
    try {
      const response = await axios.get(`${this.baseUrl}/fixtures?league=1&season=2026`, { headers: this.getHeaders(), timeout: 10000 });
      const fixtures = response.data?.response || [];
      return fixtures.filter((f: any) => f.fixture?.status?.short === "FT").slice(0, 10).map((f: any) => this.mapFixture(f));
    } catch (e: any) {
      throw new Error(`API-Football getCompletedMatches failed: ${e.message}`);
    }
  }

  async getMatchById(id: string): Promise<any> {
    this.validateKey();
    try {
      const response = await axios.get(`${this.baseUrl}/fixtures?id=${id}`, { headers: this.getHeaders(), timeout: 10000 });
      const res = response.data?.response?.[0];
      if (!res) throw new Error("Match not found in API-Football");
      return this.mapFixture(res);
    } catch (e: any) {
      throw new Error(`API-Football getMatchById failed: ${e.message}`);
    }
  }

  async getMatchEvents(matchId: string): Promise<any[]> {
    this.validateKey();
    try {
      const response = await axios.get(`${this.baseUrl}/fixtures/events?fixture=${matchId}`, { headers: this.getHeaders(), timeout: 10000 });
      return (response.data?.response || []).map((ev: any) => ({
        minute: ev.time?.elapsed || 0,
        type: ev.type,
        team: ev.team?.name,
        player: ev.player?.name,
        assist: ev.assist?.name || null,
        detail: ev.detail || ""
      }));
    } catch (e: any) {
      throw new Error(`API-Football getMatchEvents failed: ${e.message}`);
    }
  }

  async getMatchStatistics(matchId: string): Promise<any> {
    this.validateKey();
    try {
      const response = await axios.get(`${this.baseUrl}/fixtures/statistics?fixture=${matchId}`, { headers: this.getHeaders(), timeout: 10000 });
      const stats = response.data?.response || [];
      
      const getStat = (teamIndex: number, type: string): any => {
        const teamStats = stats[teamIndex]?.statistics || [];
        const item = teamStats.find((s: any) => s.type?.toLowerCase() === type.toLowerCase());
        return item ? item.value : 0;
      };

      return {
        possession: { home: getStat(0, "Ball Possession") || 50, away: getStat(1, "Ball Possession") || 50 },
        shots: { home: getStat(0, "Total Shots") || 0, away: getStat(1, "Total Shots") || 0 },
        shotsOnTarget: { home: getStat(0, "Shots on Goal") || 0, away: getStat(1, "Shots on Goal") || 0 },
        corners: { home: getStat(0, "Corner Kicks") || 0, away: getStat(1, "Corner Kicks") || 0 },
        yellowCards: { home: getStat(0, "Yellow Cards") || 0, away: getStat(1, "Yellow Cards") || 0 },
        redCards: { home: getStat(0, "Red Cards") || 0, away: getStat(1, "Red Cards") || 0 },
        fouls: { home: getStat(0, "Fouls") || 0, away: getStat(1, "Fouls") || 0 },
        offside: { home: getStat(0, "Offsides") || 0, away: getStat(1, "Offsides") || 0 }
      };
    } catch (e: any) {
      throw new Error(`API-Football getMatchStatistics failed: ${e.message}`);
    }
  }

  async getTeams(): Promise<any[]> {
    this.validateKey();
    try {
      // League ID 1 represents World Cup
      const response = await axios.get(`${this.baseUrl}/teams?league=1&season=2026`, { headers: this.getHeaders(), timeout: 10000 });
      return (response.data?.response || []).map((t: any) => ({
        id: t.team?.id?.toString(),
        name: t.team?.name,
        logo: t.team?.logo,
        country: t.team?.country || "",
        coach: "Unknown Coach",
        captain: "Unknown",
        formation: "4-3-3",
        recentForm: [],
        squad: []
      }));
    } catch (e: any) {
      throw new Error(`API-Football getTeams failed: ${e.message}`);
    }
  }

  async getTeamById(id: string): Promise<any> {
    this.validateKey();
    try {
      const response = await axios.get(`${this.baseUrl}/teams?id=${id}`, { headers: this.getHeaders(), timeout: 10000 });
      const t = response.data?.response?.[0];
      if (!t) throw new Error("Team not found in API-Football");

      // Fetch squad as well
      let squad: any[] = [];
      try {
        const squadResp = await axios.get(`${this.baseUrl}/players?team=${id}&season=2026`, { headers: this.getHeaders(), timeout: 10000 });
        squad = (squadResp.data?.response || []).map((p: any) => ({
          id: p.player?.id?.toString(),
          name: p.player?.name,
          position: p.statistics?.[0]?.games?.position || "Player",
          age: p.player?.age || 25,
          nationality: p.player?.nationality || "",
          goals: p.statistics?.[0]?.goals?.total || 0,
          assists: p.statistics?.[0]?.goals?.assists || 0,
          yellowCards: p.statistics?.[0]?.cards?.yellow || 0,
          redCards: p.statistics?.[0]?.cards?.red || 0,
          minutesPlayed: p.statistics?.[0]?.games?.minutes || 0
        }));
      } catch (sqErr) {
        console.warn("Could not load squad details:", sqErr);
      }

      return {
        id: t.team?.id?.toString(),
        name: t.team?.name,
        logo: t.team?.logo,
        country: t.team?.country || "",
        coach: "Unknown Coach",
        captain: squad[0]?.name || "Unknown",
        formation: "4-3-3",
        recentForm: [],
        squad
      };
    } catch (e: any) {
      throw new Error(`API-Football getTeamById failed: ${e.message}`);
    }
  }

  async getPlayerById(id: string): Promise<any> {
    this.validateKey();
    try {
      const response = await axios.get(`${this.baseUrl}/players?id=${id}&season=2026`, { headers: this.getHeaders(), timeout: 10000 });
      const p = response.data?.response?.[0];
      if (!p) throw new Error("Player not found in API-Football");
      return {
        id: p.player?.id?.toString(),
        name: p.player?.name,
        position: p.statistics?.[0]?.games?.position || "Player",
        age: p.player?.age || 25,
        nationality: p.player?.nationality || "",
        goals: p.statistics?.[0]?.goals?.total || 0,
        assists: p.statistics?.[0]?.goals?.assists || 0,
        yellowCards: p.statistics?.[0]?.cards?.yellow || 0,
        redCards: p.statistics?.[0]?.cards?.red || 0,
        minutesPlayed: p.statistics?.[0]?.games?.minutes || 0
      };
    } catch (e: any) {
      throw new Error(`API-Football getPlayerById failed: ${e.message}`);
    }
  }

  async getStandings(): Promise<any> {
    this.validateKey();
    try {
      const response = await axios.get(`${this.baseUrl}/standings?league=1&season=2026`, { headers: this.getHeaders(), timeout: 10000 });
      const standingsList = response.data?.response?.[0]?.league?.standings || [];
      return {
        competition: response.data?.response?.[0]?.league?.name || "FIFA World Cup",
        standings: standingsList.map((st: any, idx: number) => ({
          group: st[0]?.group || `Group ${String.fromCharCode(65 + idx)}`,
          table: st.map((t: any) => ({
            position: t.rank,
            team: {
              id: t.team?.id?.toString() || "",
              name: t.team?.name || "",
              logo: t.team?.logo || ""
            },
            playedGames: t.all?.played || 0,
            won: t.all?.win || 0,
            draw: t.all?.draw || 0,
            lost: t.all?.lose || 0,
            points: t.points || 0,
            goalsFor: t.all?.goals?.for || 0,
            goalsAgainst: t.all?.goals?.against || 0,
            goalDifference: t.goalsDiff || 0,
            qualificationStatus: t.description || "In Progress"
          }))
        }))
      };
    } catch (e: any) {
      throw new Error(`API-Football getStandings failed: ${e.message}`);
    }
  }
}
