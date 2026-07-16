import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

async function testSportsAPI() {
  console.log("Starting automated Sports Data REST API Verification...");
  
  try {
    // 1. Login to get authentication token
    console.log("\nLogging in as John Doe...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: "john.doe@fifa.com",
      password: "Password123!",
    });
    
    if (!loginResponse.data?.success || !loginResponse.data?.accessToken) {
      console.error("✗ Login failed:", loginResponse.data);
      process.exit(1);
    }
    
    const token = loginResponse.data.accessToken;
    console.log("✓ Login successful! Token received.");
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // 2. Test Live Matches endpoint
    console.log("\nTesting GET /api/matches/live...");
    const liveMatchesResponse = await axios.get(`${BASE_URL}/matches/live`, authHeaders);
    if (liveMatchesResponse.data?.success && liveMatchesResponse.data?.data?.docs) {
      console.log("✓ Live matches retrieved successfully!");
      const matches = liveMatchesResponse.data.data.docs;
      console.log(`Count: ${matches.length}`);
      if (matches.length > 0) {
        console.log(`Match A: ${matches[0].homeTeam} vs ${matches[0].awayTeam} (${matches[0].status})`);
        console.log(`Score: ${matches[0].liveData?.score?.home} - ${matches[0].liveData?.score?.away}`);
        console.log(`Match Minute: ${matches[0].minute}'`);
      }
    } else {
      console.error("✗ Live matches failed:", liveMatchesResponse.data);
    }

    // 3. Test Upcoming Matches endpoint
    console.log("\nTesting GET /api/matches/upcoming...");
    const upcomingMatchesResponse = await axios.get(`${BASE_URL}/matches/upcoming`, authHeaders);
    if (upcomingMatchesResponse.data?.success && upcomingMatchesResponse.data?.data?.docs) {
      console.log("✓ Upcoming matches retrieved successfully!");
      const matches = upcomingMatchesResponse.data.data.docs;
      console.log(`Count: ${matches.length}`);
      if (matches.length > 0) {
        console.log(`Upcoming A: ${matches[0].homeTeam} vs ${matches[0].awayTeam} (${matches[0].status})`);
      }
    } else {
      console.error("✗ Upcoming matches failed:", upcomingMatchesResponse.data);
    }

    // 4. Test Completed Matches endpoint
    console.log("\nTesting GET /api/matches/completed...");
    const completedMatchesResponse = await axios.get(`${BASE_URL}/matches/completed`, authHeaders);
    if (completedMatchesResponse.data?.success && completedMatchesResponse.data?.data?.docs) {
      console.log("✓ Completed matches retrieved successfully!");
      const matches = completedMatchesResponse.data.data.docs;
      console.log(`Count: ${matches.length}`);
      if (matches.length > 0) {
        console.log(`Completed A: ${matches[0].homeTeam} vs ${matches[0].awayTeam} (${matches[0].status})`);
      }
    } else {
      console.error("✗ Completed matches failed:", completedMatchesResponse.data);
    }

    // 5. Test getMatchById endpoint
    console.log("\nTesting GET /api/matches/:id with Live Match ID...");
    const matchesResponse = await axios.get(`${BASE_URL}/matches`, authHeaders);
    const matchId = matchesResponse.data?.data?.docs?.[0]?._id;
    if (matchId) {
      const matchDetailResponse = await axios.get(`${BASE_URL}/matches/${matchId}`, authHeaders);
      if (matchDetailResponse.data?.success) {
        console.log("✓ Match details by ID retrieved successfully!");
        console.log("Match Teams:", matchDetailResponse.data.data.homeTeam, "vs", matchDetailResponse.data.data.awayTeam);
        console.log("Match Stadium:", matchDetailResponse.data.data.stadiumId?.name);
      } else {
        console.error("✗ Match details by ID failed:", matchDetailResponse.data);
      }

      // 6. Test Match Events endpoint
      console.log(`\nTesting GET /api/matches/${matchId}/events...`);
      const eventsResponse = await axios.get(`${BASE_URL}/matches/${matchId}/events`, authHeaders);
      if (eventsResponse.data?.success) {
        console.log("✓ Match events retrieved successfully!");
        console.log("Events count:", eventsResponse.data.data?.length);
        if (eventsResponse.data.data?.length > 0) {
          console.log("Last Event:", eventsResponse.data.data[eventsResponse.data.data.length - 1]);
        }
      } else {
        console.error("✗ Match events failed:", eventsResponse.data);
      }

      // 7. Test Match Statistics endpoint
      console.log(`\nTesting GET /api/matches/${matchId}/statistics...`);
      const statsResponse = await axios.get(`${BASE_URL}/matches/${matchId}/statistics`, authHeaders);
      if (statsResponse.data?.success) {
        console.log("✓ Match statistics retrieved successfully!");
        console.log("Possession stats:", statsResponse.data.data?.possession);
        console.log("Shots stats:", statsResponse.data.data?.shots);
      } else {
        console.error("✗ Match statistics failed:", statsResponse.data);
      }
    } else {
      console.log("No match found in DB to test by ID.");
    }

    // 8. Test Teams endpoint
    console.log("\nTesting GET /api/teams...");
    const teamsResponse = await axios.get(`${BASE_URL}/teams`, authHeaders);
    if (teamsResponse.data?.success && teamsResponse.data?.data?.docs) {
      console.log("✓ Teams list retrieved successfully!");
      const teams = teamsResponse.data.data.docs;
      console.log(`Count: ${teams.length}`);
      if (teams.length > 0) {
        console.log(`Team A: ${teams[0].name} (${teams[0].coach})`);
        
        // 9. Test getTeamById
        const teamId = teams[0].id;
        console.log(`\nTesting GET /api/teams/${teamId}...`);
        const teamDetailResponse = await axios.get(`${BASE_URL}/teams/${teamId}`, authHeaders);
        if (teamDetailResponse.data?.success) {
          console.log("✓ Team details retrieved successfully!");
          console.log("Squad size:", teamDetailResponse.data.data.squad?.length);
          
          // 10. Test getPlayerById
          const playerId = teamDetailResponse.data.data.squad?.[0]?.id;
          if (playerId) {
            console.log(`\nTesting GET /api/players/${playerId}...`);
            const playerResponse = await axios.get(`${BASE_URL}/players/${playerId}`, authHeaders);
            if (playerResponse.data?.success) {
              console.log("✓ Player details retrieved successfully!");
              console.log("Player:", playerResponse.data.data.name, "Position:", playerResponse.data.data.position);
            } else {
              console.error("✗ Player details failed:", playerResponse.data);
            }
          }
        } else {
          console.error("✗ Team details failed:", teamDetailResponse.data);
        }
      }
    } else {
      console.error("✗ Teams list failed:", teamsResponse.data);
    }

    // 11. Test Standings endpoint
    console.log("\nTesting GET /api/standings...");
    const standingsResponse = await axios.get(`${BASE_URL}/standings`, authHeaders);
    if (standingsResponse.data?.success && standingsResponse.data?.data?.standings) {
      console.log("✓ Group Standings retrieved successfully!");
      console.log("Groups count:", standingsResponse.data.data.standings.length);
      console.log("Group A Top Team:", standingsResponse.data.data.standings[0]?.table?.[0]?.team?.name);
    } else {
      console.error("✗ Standings failed:", standingsResponse.data);
    }

    // 12. Test Weather endpoint
    console.log("\nTesting GET /api/stadiums to get a stadium ID...");
    const stadiumsResponse = await axios.get(`${BASE_URL}/stadiums`, authHeaders);
    const stadiumId = stadiumsResponse.data?.data?.docs?.[0]?._id;
    if (stadiumId) {
      console.log(`\nTesting GET /api/weather/stadium/${stadiumId}...`);
      const weatherResponse = await axios.get(`${BASE_URL}/weather/stadium/${stadiumId}`, authHeaders);
      if (weatherResponse.data?.success) {
        console.log("✓ Stadium weather retrieved successfully!");
        console.log("Weather:", weatherResponse.data.data.condition, "Temp:", weatherResponse.data.data.temperature);
      } else {
        console.error("✗ Stadium weather failed:", weatherResponse.data);
      }
    } else {
      console.log("No stadiums found in DB to test weather.");
    }

    console.log("\n✓ All Sports Live API tests completed successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("✗ Sports API verification failed:", error.message || error);
    if (error.response) {
      console.error("Response details:", error.response.data);
    }
    process.exit(1);
  }
}

testSportsAPI();
