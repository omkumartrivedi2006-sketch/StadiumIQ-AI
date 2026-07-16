import { SportsProviderInterface } from "./SportsProviderInterface";

export class MockSportsProvider implements SportsProviderInterface {
  name = "MockSportsProvider";

  // Helper to get dynamic elapsed time (0 to 90 minutes) based on current clock
  private getMatchTime(): { minute: number; period: "1H" | "HT" | "2H" | "FT" } {
    const minutes = new Date().getMinutes(); // 0 to 59
    // Map 60 wall-clock minutes to a 90-minute match flow
    const elapsed = Math.floor(minutes * 1.5);
    
    if (elapsed === 0) {
      return { minute: 0, period: "1H" };
    } else if (elapsed < 45) {
      return { minute: elapsed, period: "1H" };
    } else if (elapsed >= 45 && elapsed < 50) {
      return { minute: 45, period: "HT" };
    } else if (elapsed >= 50 && elapsed < 90) {
      return { minute: elapsed, period: "2H" };
    } else {
      return { minute: 90, period: "FT" };
    }
  }

  // Predefined Mock Teams with complete profiles
  private mockTeams: Record<string, any> = {
    "USA": {
      id: "usa",
      name: "United States",
      logo: "https://crests.football-data.org/782.svg",
      country: "USA",
      coach: "Mauricio Pochettino",
      captain: "Christian Pulisic",
      formation: "4-2-3-1",
      recentForm: ["W", "D", "W", "L", "W"],
      squad: [
        { id: "pulisic", name: "Christian Pulisic", position: "Forward", age: 27, nationality: "USA", goals: 5, assists: 3, yellowCards: 1, redCards: 0, minutesPlayed: 360 },
        { id: "mckennie", name: "Weston McKennie", position: "Midfielder", age: 27, nationality: "USA", goals: 2, assists: 4, yellowCards: 2, redCards: 0, minutesPlayed: 345 },
        { id: "balogun", name: "Folarin Balogun", position: "Forward", age: 24, nationality: "USA", goals: 4, assists: 1, yellowCards: 0, redCards: 0, minutesPlayed: 280 },
        { id: "adams", name: "Tyler Adams", position: "Midfielder", age: 27, nationality: "USA", goals: 0, assists: 1, yellowCards: 3, redCards: 0, minutesPlayed: 320 },
        { id: "turner", name: "Matt Turner", position: "Goalkeeper", age: 31, nationality: "USA", goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 360 }
      ]
    },
    "Mexico": {
      id: "mexico",
      name: "Mexico",
      logo: "https://crests.football-data.org/1072.svg",
      country: "Mexico",
      coach: "Javier Aguirre",
      captain: "Edson Álvarez",
      formation: "4-3-3",
      recentForm: ["D", "W", "L", "W", "D"],
      squad: [
        { id: "gimenez", name: "Santiago Giménez", position: "Forward", age: 24, nationality: "Mexico", goals: 3, assists: 1, yellowCards: 1, redCards: 0, minutesPlayed: 310 },
        { id: "alvarez", name: "Edson Álvarez", position: "Midfielder", age: 28, nationality: "Mexico", goals: 1, assists: 2, yellowCards: 4, redCards: 0, minutesPlayed: 360 },
        { id: "chavez", name: "Luis Chávez", position: "Midfielder", age: 30, nationality: "Mexico", goals: 2, assists: 1, yellowCards: 1, redCards: 0, minutesPlayed: 330 },
        { id: "montes", name: "César Montes", position: "Defender", age: 28, nationality: "Mexico", goals: 0, assists: 0, yellowCards: 2, redCards: 1, minutesPlayed: 270 }
      ]
    },
    "Canada": {
      id: "canada",
      name: "Canada",
      logo: "https://crests.football-data.org/766.svg",
      country: "Canada",
      coach: "Jesse Marsch",
      captain: "Alphonso Davies",
      formation: "4-4-2",
      recentForm: ["W", "L", "W", "D", "W"],
      squad: [
        { id: "david", name: "Jonathan David", position: "Forward", age: 26, nationality: "Canada", goals: 4, assists: 2, yellowCards: 0, redCards: 0, minutesPlayed: 350 },
        { id: "davies", name: "Alphonso Davies", position: "Defender", age: 25, nationality: "Canada", goals: 1, assists: 4, yellowCards: 1, redCards: 0, minutesPlayed: 360 },
        { id: "eustaquio", name: "Stephen Eustáquio", position: "Midfielder", age: 29, nationality: "Canada", goals: 1, assists: 1, yellowCards: 2, redCards: 0, minutesPlayed: 360 }
      ]
    },
    "Argentina": {
      id: "argentina",
      name: "Argentina",
      logo: "https://crests.football-data.org/762.svg",
      country: "Argentina",
      coach: "Lionel Scaloni",
      captain: "Lionel Messi",
      formation: "4-3-3",
      recentForm: ["W", "W", "W", "D", "W"],
      squad: [
        { id: "messi", name: "Lionel Messi", position: "Forward", age: 38, nationality: "Argentina", goals: 6, assists: 5, yellowCards: 0, redCards: 0, minutesPlayed: 360 },
        { id: "martinez_la", name: "Lautaro Martínez", position: "Forward", age: 28, nationality: "Argentina", goals: 5, assists: 1, yellowCards: 1, redCards: 0, minutesPlayed: 290 },
        { id: "fernandez", name: "Enzo Fernández", position: "Midfielder", age: 25, nationality: "Argentina", goals: 1, assists: 3, yellowCards: 2, redCards: 0, minutesPlayed: 340 }
      ]
    },
    "Brazil": {
      id: "brazil",
      name: "Brazil",
      logo: "https://crests.football-data.org/764.svg",
      country: "Brazil",
      coach: "Dorival Júnior",
      captain: "Marquinhos",
      formation: "4-2-3-1",
      recentForm: ["W", "D", "L", "W", "W"],
      squad: [
        { id: "vinicius", name: "Vinícius Júnior", position: "Forward", age: 25, nationality: "Brazil", goals: 3, assists: 4, yellowCards: 2, redCards: 0, minutesPlayed: 330 },
        { id: "rodrygo", name: "Rodrygo Goes", position: "Forward", age: 25, nationality: "Brazil", goals: 2, assists: 2, yellowCards: 1, redCards: 0, minutesPlayed: 310 },
        { id: "guimaraes", name: "Bruno Guimarães", position: "Midfielder", age: 28, nationality: "Brazil", goals: 1, assists: 1, yellowCards: 3, redCards: 0, minutesPlayed: 350 }
      ]
    },
    "France": {
      id: "france",
      name: "France",
      logo: "https://crests.football-data.org/773.svg",
      country: "France",
      coach: "Didier Deschamps",
      captain: "Kylian Mbappé",
      formation: "4-3-3",
      recentForm: ["W", "W", "D", "W", "L"],
      squad: [
        { id: "mbappe", name: "Kylian Mbappé", position: "Forward", age: 27, nationality: "France", goals: 7, assists: 2, yellowCards: 0, redCards: 0, minutesPlayed: 360 },
        { id: "griezmann", name: "Antoine Griezmann", position: "Forward", age: 35, nationality: "France", goals: 2, assists: 4, yellowCards: 1, redCards: 0, minutesPlayed: 320 },
        { id: "tchouameni", name: "Aurelien Tchouaméni", position: "Midfielder", age: 26, nationality: "France", goals: 1, assists: 0, yellowCards: 2, redCards: 0, minutesPlayed: 350 }
      ]
    }
  };

  // Simulated Events Timeline for the Live Match (USA vs Mexico)
  private getLiveEvents(elapsed: number): any[] {
    const allEvents = [
      { minute: 1, type: "Kickoff", team: "USA", player: "System", detail: "Match started at MetLife Stadium" },
      { minute: 12, type: "Goal", team: "USA", player: "Christian Pulisic", assist: "Weston McKennie", detail: "Goal! Beautiful strike into the bottom right corner" },
      { minute: 28, type: "Yellow Card", team: "Mexico", player: "Edson Álvarez", detail: "Tactical foul in the midfield" },
      { minute: 41, type: "Goal", team: "Mexico", player: "Santiago Giménez", assist: "Luis Chávez", detail: "Goal! Equalizer from close range header" },
      { minute: 45, type: "Half Time", team: "System", player: "System", detail: "First half ends. Teams level at 1-1" },
      { minute: 55, type: "Substitution", team: "USA", player: "Brenden Aaronson", assist: "Timothy Weah", detail: "Tactical substitution for fresh energy" },
      { minute: 68, type: "Yellow Card", team: "USA", player: "Tyler Adams", detail: "Aggressive tackle in defensive third" },
      { minute: 74, type: "Goal", team: "USA", player: "Folarin Balogun", assist: "Alphonso Davies", detail: "Goal! Clinical finish past the keeper" },
      { minute: 82, type: "VAR", team: "Mexico", player: "Santiago Giménez", detail: "Penalty review: Dismissed. Clean tackle" },
      { minute: 87, type: "Substitution", team: "Mexico", player: "Orbelín Pineda", assist: "Luis Chávez", detail: "Attacking replacement" },
      { minute: 89, type: "Red Card", team: "Mexico", player: "César Montes", detail: "Straight red for denied obvious goal scoring opportunity" },
      { minute: 90+2, type: "Goal", team: "USA", player: "Weston McKennie", assist: "Christian Pulisic", detail: "Goal! Sealed the win on a fast break" }
    ];

    return allEvents.filter(e => e.minute <= elapsed);
  }

  // Helper to compile scores dynamically based on elapsed minutes
  private getScoreForMinutes(elapsed: number): { home: number; away: number; period: string } {
    let home = 0;
    let away = 0;
    let period = "1ST_HALF";

    if (elapsed >= 12) home++;
    if (elapsed >= 41) away++;
    if (elapsed >= 45 && elapsed < 50) period = "HALFTIME";
    if (elapsed >= 50) period = "2ND_HALF";
    if (elapsed >= 74) home++;
    if (elapsed >= 90) {
      home++;
      period = "FULLTIME";
    }

    return { home, away, period };
  }

  // 1. Live Matches list
  async getLiveMatches(): Promise<any[]> {
    const timeState = this.getMatchTime();
    const scoreState = this.getScoreForMinutes(timeState.minute);

    return [{
      id: "live_match_1",
      competition: "FIFA World Cup 2026",
      status: timeState.minute >= 90 ? "completed" : "live",
      minute: timeState.minute,
      period: timeState.period,
      kickoffTime: "8:00 PM",
      referee: "Szymon Marciniak (Poland)",
      venue: {
        name: "MetLife Stadium",
        city: "East Rutherford",
        country: "USA",
        capacity: 82500
      },
      homeTeam: {
        id: "usa",
        name: "USA",
        logo: "https://crests.football-data.org/782.svg",
        score: scoreState.home,
        halfTimeScore: scoreState.home >= 1 ? 1 : 0,
        fullTimeScore: scoreState.home,
        possession: 52,
        shots: 14,
        shotsOnTarget: 6,
        corners: 5,
        yellowCards: elapsedYellowCards("USA", timeState.minute),
        redCards: 0,
        fouls: 11,
        offside: 2
      },
      awayTeam: {
        id: "mexico",
        name: "Mexico",
        logo: "https://crests.football-data.org/1072.svg",
        score: scoreState.away,
        halfTimeScore: scoreState.away >= 1 ? 1 : 0,
        fullTimeScore: scoreState.away,
        possession: 48,
        shots: 11,
        shotsOnTarget: 4,
        corners: 4,
        yellowCards: elapsedYellowCards("Mexico", timeState.minute),
        redCards: timeState.minute >= 89 ? 1 : 0,
        fouls: 15,
        offside: 1
      },
      events: this.getLiveEvents(timeState.minute)
    }];

    function elapsedYellowCards(team: string, min: number): number {
      if (team === "USA") return min >= 68 ? 1 : 0;
      return min >= 28 ? 1 : 0;
    }
  }

  // 2. Upcoming Matches list
  async getUpcomingMatches(): Promise<any[]> {
    return [
      {
        id: "upcoming_match_1",
        competition: "FIFA World Cup 2026",
        status: "scheduled",
        kickoffTime: "6:00 PM",
        date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days out
        referee: "Clement Turpin (France)",
        venue: {
          name: "MetLife Stadium",
          city: "East Rutherford",
          country: "USA",
          capacity: 82500
        },
        homeTeam: {
          id: "canada",
          name: "Canada",
          logo: "https://crests.football-data.org/766.svg",
          score: null
        },
        awayTeam: {
          id: "argentina",
          name: "Argentina",
          logo: "https://crests.football-data.org/762.svg",
          score: null
        }
      },
      {
        id: "upcoming_match_2",
        competition: "FIFA World Cup 2026",
        status: "scheduled",
        kickoffTime: "7:30 PM",
        date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days out
        referee: "Anthony Taylor (England)",
        venue: {
          name: "SoFi Stadium",
          city: "Los Angeles",
          country: "USA",
          capacity: 70000
        },
        homeTeam: {
          id: "brazil",
          name: "Brazil",
          logo: "https://crests.football-data.org/764.svg",
          score: null
        },
        awayTeam: {
          id: "france",
          name: "France",
          logo: "https://crests.football-data.org/773.svg",
          score: null
        }
      }
    ];
  }

  // 3. Completed Matches list
  async getCompletedMatches(): Promise<any[]> {
    return [
      {
        id: "completed_match_1",
        competition: "FIFA World Cup 2026",
        status: "completed",
        kickoffTime: "Finished",
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        referee: "Daniele Orsato (Italy)",
        venue: {
          name: "SoFi Stadium",
          city: "Los Angeles",
          country: "USA",
          capacity: 70000
        },
        homeTeam: {
          id: "brazil",
          name: "Brazil",
          logo: "https://crests.football-data.org/764.svg",
          score: 2,
          halfTimeScore: 1,
          fullTimeScore: 2
        },
        awayTeam: {
          id: "mexico",
          name: "Mexico",
          logo: "https://crests.football-data.org/1072.svg",
          score: 0,
          halfTimeScore: 0,
          fullTimeScore: 0
        }
      }
    ];
  }

  // 4. Match details by ID
  async getMatchById(id: string): Promise<any> {
    const liveMatches = await this.getLiveMatches();
    if (id === "live_match_1" || id === "live") {
      return liveMatches[0];
    }
    
    const upcoming = await this.getUpcomingMatches();
    const foundUpcoming = upcoming.find(u => u.id === id);
    if (foundUpcoming) return foundUpcoming;

    const completed = await this.getCompletedMatches();
    const foundCompleted = completed.find(c => c.id === id);
    if (foundCompleted) return foundCompleted;

    // Default Fallback mapping so that any query succeeds
    return liveMatches[0];
  }

  // 5. Match Events list
  async getMatchEvents(matchId: string): Promise<any[]> {
    const timeState = this.getMatchTime();
    return this.getLiveEvents(timeState.minute);
  }

  // 6. Match Statistics
  async getMatchStatistics(matchId: string): Promise<any> {
    const match = await this.getMatchById(matchId);
    return {
      possession: { home: match.homeTeam.possession || 50, away: match.awayTeam.possession || 50 },
      shots: { home: match.homeTeam.shots || 0, away: match.awayTeam.shots || 0 },
      shotsOnTarget: { home: match.homeTeam.shotsOnTarget || 0, away: match.awayTeam.shotsOnTarget || 0 },
      corners: { home: match.homeTeam.corners || 0, away: match.awayTeam.corners || 0 },
      yellowCards: { home: match.homeTeam.yellowCards || 0, away: match.awayTeam.yellowCards || 0 },
      redCards: { home: match.homeTeam.redCards || 0, away: match.awayTeam.redCards || 0 },
      fouls: { home: match.homeTeam.fouls || 0, away: match.awayTeam.fouls || 0 },
      offside: { home: match.homeTeam.offside || 0, away: match.awayTeam.offside || 0 }
    };
  }

  // 7. Get all teams
  async getTeams(): Promise<any[]> {
    return Object.values(this.mockTeams);
  }

  // 8. Get team by ID
  async getTeamById(id: string): Promise<any> {
    const norm = id.toUpperCase();
    const team = this.mockTeams[norm];
    if (team) return team;
    
    // Find case-insensitive
    const key = Object.keys(this.mockTeams).find(k => k.toLowerCase() === id.toLowerCase() || this.mockTeams[k].id === id.toLowerCase());
    return key ? this.mockTeams[key] : this.mockTeams["USA"];
  }

  // 9. Get player details by ID
  async getPlayerById(id: string): Promise<any> {
    for (const team of Object.values(this.mockTeams)) {
      const player = team.squad.find((p: any) => p.id === id || p.name.toLowerCase().includes(id.toLowerCase()));
      if (player) return player;
    }
    return {
      id: "generic_player",
      name: "Alex Morgan",
      position: "Forward",
      age: 30,
      nationality: "USA",
      goals: 12,
      assists: 8,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 450
    };
  }

  // 10. Group Standings
  async getStandings(): Promise<any> {
    return {
      competition: "FIFA World Cup 2026",
      standings: [
        {
          group: "Group A",
          table: [
            { position: 1, team: { id: "usa", name: "USA", logo: "https://crests.football-data.org/782.svg" }, playedGames: 2, won: 2, draw: 0, lost: 0, points: 6, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, qualificationStatus: "Qualified" },
            { position: 2, team: { id: "mexico", name: "Mexico", logo: "https://crests.football-data.org/1072.svg" }, playedGames: 2, won: 1, draw: 0, lost: 1, points: 3, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, qualificationStatus: "In Progress" },
            { position: 3, team: { id: "canada", name: "Canada", logo: "https://crests.football-data.org/766.svg" }, playedGames: 2, won: 0, draw: 1, lost: 1, points: 1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, qualificationStatus: "In Progress" },
            { position: 4, team: { id: "panama", name: "Panama", logo: "https://crests.football-data.org/1908.svg" }, playedGames: 2, won: 0, draw: 1, lost: 1, points: 1, goalsFor: 1, goalsAgainst: 2, goalDifference: -1, qualificationStatus: "Eliminated" }
          ]
        },
        {
          group: "Group B",
          table: [
            { position: 1, team: { id: "argentina", name: "Argentina", logo: "https://crests.football-data.org/762.svg" }, playedGames: 2, won: 2, draw: 0, lost: 0, points: 6, goalsFor: 6, goalsAgainst: 0, goalDifference: 6, qualificationStatus: "Qualified" },
            { position: 2, team: { id: "brazil", name: "Brazil", logo: "https://crests.football-data.org/764.svg" }, playedGames: 2, won: 1, draw: 1, lost: 0, points: 4, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, qualificationStatus: "In Progress" },
            { position: 3, team: { id: "france", name: "France", logo: "https://crests.football-data.org/773.svg" }, playedGames: 2, won: 0, draw: 1, lost: 1, points: 1, goalsFor: 2, goalsAgainst: 5, goalDifference: -3, qualificationStatus: "In Progress" },
            { position: 4, team: { id: "chile", name: "Chile", logo: "https://crests.football-data.org/763.svg" }, playedGames: 2, won: 0, draw: 0, lost: 2, points: 0, goalsFor: 0, goalsAgainst: 5, goalDifference: -5, qualificationStatus: "Eliminated" }
          ]
        }
      ]
    };
  }
}
