import { chatHistoryRepository } from "../repositories/chatHistoryRepository";
import { foodService } from "./foodService";
import { transportService } from "./transportService";
import { sosService } from "./sosService";
import { stadiumRepository } from "../repositories/stadiumRepository";
import { matchService } from "./matchService";
import { analyticsService } from "./analyticsService";
import { sportsStandingRepository } from "./sportsApi/repositories/SportsStandingRepository";
import { sportsStadiumRepository } from "./sportsApi/repositories/SportsStadiumRepository";
import { liveLocationRepository } from "../repositories/liveLocationRepository";
import { mapLocationRepository } from "../repositories/mapLocationRepository";
import { parkingSlotRepository } from "../repositories/parkingSlotRepository";
import { routeRepository } from "../repositories/routeRepository";

const METLIFE_FACILITIES = {
  gates: [
    { name: "Gate 1 (North)", lat: 40.8145, lng: -74.0755 },
    { name: "Gate 2 (East)", lat: 40.8138, lng: -74.0725 },
    { name: "Gate 3 (South)", lat: 40.8123, lng: -74.0736 },
    { name: "Gate 4 (West)", lat: 40.8128, lng: -74.0760 },
  ],
  medical: [
    { name: "First Aid & Medical Room C", lat: 40.8132, lng: -74.0740 },
    { name: "Emergency Dispatch Desk - Gate 3", lat: 40.8124, lng: -74.0735 },
  ],
  food: [
    { name: "World Cup Food Plaza", lat: 40.8139, lng: -74.0748 },
    { name: "Halal & Vegan Stalls Court", lat: 40.8131, lng: -74.0739 },
  ],
  accessibility: [
    { name: "ADA Accessible Lift & Ramp - Section B", lat: 40.8136, lng: -74.0746 },
    { name: "Accessible Restroom - Gate 3 Lobby", lat: 40.8125, lng: -74.0737 },
  ],
};

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// CENTRALIZED PROMPT TEMPLATES
const promptTemplates = {
  chat: (role: string, language: string, context: string) => `
You are "StadiumIQ AI", a highly capable, multilingual stadium assistant for the FIFA World Cup 2026.
Your primary objective is to assist users based on their operational profile.
The user is logged in with the role: [${role}].
You must respond in the language corresponding to code: [${language}] (e.g. en, es, fr, pt, ar, hi).
Be friendly, professional, and role-appropriate.

FORMATTING RULES:
- Provide highly detailed, structured, and informative answers.
- Use Markdown formatting: bold titles, clean bullet points, numbered steps, or markdown tables for schedules/food stalls/transport lines.
- Always be concise but extremely clear, avoiding raw coordinates and providing helpful landmarks.

OPERATIONAL WORLD CUP STADIUM CONTEXT:
${context}
`,

  navigation: (role: string, language: string, context: string) => `
You are the "Smart Stadium Navigation Assistant" for the FIFA World Cup 2026.
Provide clear, step-by-step route suggestions, directions, or walking guidance.
The user's role is: [${role}].
You must respond in the language code: [${language}].
Highlight wheelchair-friendly entrances, lifts, restrooms, or emergency exits where appropriate.

FORMATTING RULES:
- Give clean, step-by-step directions using bullet points.
- Highlight specific entry/exit gate numbers and reference locations.

STADIUM NAVIGATION & GATE WAYFINDING CONTEXT:
${context}
`,

  crowd: (role: string, language: string, context: string) => `
You are the "Venue Crowd Intelligence Assistant" for the FIFA World Cup 2026.
Analyze gate congestion, occupancy status, safety levels, and waiting times.
Provide suggestions on less crowded entrances or exits.
The user's role is: [${role}].
You must respond in the language code: [${language}].

FORMATTING RULES:
- Present congestion lists in clear Markdown tables or bulleted sections.
- Make recommendations bold to grab immediate attention.

LIVE GATE OCCUPANCY & CROWD STATUS CONTEXT:
${context}
`,

  transport: (role: string, language: string, context: string) => `
You are the "Transport & Transit Assistant" for the FIFA World Cup 2026.
Provide transit suggestions (Metro lanes, bus shuttles, rideshare zones, parking availability, and walking paths).
The user's role is: [${role}].
You must respond in the language code: [${language}].

FORMATTING RULES:
- List parking zones, metro lines, and shuttles clearly using bold titles or Markdown tables.
- Mention estimated queue times and walking distances to gates.

TRANSIT OPTION & PARKING STATUS CONTEXT:
${context}
`,

  food: (role: string, language: string, context: string) => `
You are the "Food Recommendation AI" for the FIFA World Cup 2026.
Recommend food stalls, items, and vendors based on user preferences and dietary requirements (e.g. Vegetarian, Vegan, Halal, Fast food).
Sort or filter by waiting time, ratings, and proximity.
The user's role is: [${role}].
You must respond in the language code: [${language}].

FORMATTING RULES:
- Use bullet points and bold text to list recommended food stalls.
- Clearly present: Specialty, Location (Section/Gate), Queue Time, and Rating.

AVAILABLE FOOD VENDORS & LIVE QUEUE CONTEXT:
${context}
`,

  accessibility: (role: string, language: string, context: string) => `
You are the "Accessibility Assistant" for the FIFA World Cup 2026.
Recommend wheelchair routes, elevators, ramps, accessible restrooms, medical rooms, hearing loops, and visual assist guides.
The user's role is: [${role}].
You must respond in the language code: [${language}].

FORMATTING RULES:
- Be highly descriptive about step-free access routes, lifts, elevators, and accessible amenities.
- Use clean, structured list elements.

ACCESSIBILITY ACCUMULATIONS CONTEXT:
${context}
`,

  emergency: (role: string, language: string, context: string) => `
You are the "Emergency Support Assistant" for the FIFA World Cup 2026.
Provide IMMEDIATE, calm, and concise security recommendations or evacuation guidance.
Instruct the user on what to do for medical rooms, fires, safety incidents, or lost items.
The user's role is: [${role}].
You must respond in the language code: [${language}].

FORMATTING RULES:
- Keep guidelines short, bold, and numbered for quick, emergency readability.
- Clearly point out emergency phone numbers and the nearest gate exit.

EMERGENCY LOGISTICS & RESCUE CONTACTS CONTEXT:
${context}
`
};

export const aiService = {
  // 1. DYNAMIC DATABASE-DRIVEN CONTEXT BUILDERS
  async buildContext(feature: string): Promise<string> {
    try {
      switch (feature) {
        case "food": {
          const vendorsResp = await foodService.getAllFoodVendors({}, { limit: 50 });
          if (!vendorsResp.docs || vendorsResp.docs.length === 0) return "No food vendors currently listed.";
          return vendorsResp.docs.map((v: any) => 
            `- Stall: ${v.name} (${v.category}), Location: ${v.location}, Queue: ${v.queueTime}m wait, Rating: ${v.rating}★, Specialties: ${v.price}`
          ).join("\n");
        }
        case "transport": {
          const transportResp = await transportService.getAllTransportOptions({}, { limit: 50 });
          if (!transportResp.docs || transportResp.docs.length === 0) return "No transport options listed.";
          return transportResp.docs.map((t: any) => 
            `- Route: ${t.type} (${t.routeName}), Destination: ${t.destination}, Schedule: ${t.schedule}, Status: ${t.status}, Gate access: ${t.stadiumId?.name || "General Entrance"}`
          ).join("\n");
        }
        case "emergency": {
          const sosResp = await sosService.getAllSOSReports({ status: "active" }, { limit: 10 });
          const activeSOSStr = sosResp.docs && sosResp.docs.length > 0 
            ? sosResp.docs.map((s: any) => `* Distress report active at: ${s.location} (${s.emergencyType})`).join("\n")
            : "No active SOS signals.";
          return `Emergency Contacts:\n- Medical desk: +1 (555) 0101\n- Stadium Security: +1 (555) 0100\n- Evacuation exits: Gate 3 & Gate 4\nActive Distresses:\n${activeSOSStr}`;
        }
        case "crowd": {
          const stadiumResp = await stadiumRepository.find({}, { limit: 5 });
          if (!stadiumResp.docs || stadiumResp.docs.length === 0) return "No stadium gate status available.";
          return stadiumResp.docs.map((s: any) => {
            const gatesStr = (s.gates || ["Gate 1", "Gate 2", "Gate 3", "Gate 4"]).map((g: string) => 
              `${g}: Low-Medium congestion, wait time ~5m`
            ).join(", ");
            return `- Stadium: ${s.name} (${s.city}), Gate statuses: ${gatesStr}`;
          }).join("\n");
        }
        case "navigation": {
          const locationsResult = await mapLocationRepository.find({}, { limit: 100 });
          const routesResult = await routeRepository.find({}, { limit: 100 });
          const parkingResult = await parkingSlotRepository.find({}, { limit: 100 });

          const locStr = locationsResult.docs.map(loc => 
            `- ${loc.name} (Category: ${loc.category}, Lat: ${loc.latitude}, Lng: ${loc.longitude}, Status: ${loc.status}, Hours: ${loc.openingHours})`
          ).join("\n");

          const routeStr = routesResult.docs.map(r => 
            `- Route "${r.name}" (${r.category}): from [${r.startLatitude}, ${r.startLongitude}] to [${r.endLatitude}, ${r.endLongitude}] - Distance: ${r.distance}m, Walk Time: ${r.walkTime} min`
          ).join("\n");

          const parkStr = parkingResult.docs.map(p => 
            `- Parking Lot "${p.parkingName}" (${p.parkingType}): Lat: ${p.latitude}, Lng: ${p.longitude}, Available: ${p.availableSlots}/${p.capacity} slots, Status: ${p.status}`
          ).join("\n");

          return `STADIUM WAYFINDING MAP LOCATIONS:\n${locStr}\n\nPRE-DEFINED ROUTES:\n${routeStr}\n\nPARKING PLOTS:\n${parkStr}`;
        }
        case "accessibility": {
          const locationsResult = await mapLocationRepository.find({ category: { $in: ["restroom", "seating", "medical", "gate"] } }, { limit: 100 });
          const routesResult = await routeRepository.find({ category: "wheelchair" }, { limit: 100 });
          const parkingResult = await parkingSlotRepository.find({ parkingType: "Accessible" }, { limit: 50 });

          const locStr = locationsResult.docs.map(loc => 
            `- ${loc.name} (Category: ${loc.category}, Lat: ${loc.latitude}, Lng: ${loc.longitude})`
          ).join("\n");

          const routeStr = routesResult.docs.map(r => 
            `- Accessible Wheelchair Path "${r.name}": Distance: ${r.distance}m, Walk Time: ${r.walkTime} min`
          ).join("\n");

          const parkStr = parkingResult.docs.map(p => 
            `- Accessible Parking "${p.parkingName}": Available: ${p.availableSlots}/${p.capacity} slots`
          ).join("\n");

          return `ACCESSIBLE FACILITIES:\n${locStr}\n\nACCESSIBLE PATHS:\n${routeStr}\n\nACCESSIBLE PARKING:\n${parkStr}`;
        }
        case "chat":
        default: {
          const matchesResp = await matchService.getAllMatches({}, { limit: 5 });
          const stadiumResp = await stadiumRepository.find({}, { limit: 5 });
          
          let standingsStr = "Standings not available.";
          try {
            const standingsData = await sportsStandingRepository.getStandings();
            standingsStr = standingsData.standings.map((st: any) => 
              `* ${st.group}:\n` + st.table.map((t: any) => 
                `  - Pos ${t.position}. ${t.team.name}: P${t.playedGames} W${t.won} D${t.draw} L${t.lost} Pts${t.points} GD${t.goalDifference} (${t.qualificationStatus})`
              ).join("\n")
            ).join("\n\n");
          } catch (e) {
            console.error("Failed to build standings context for AI:", e);
          }

          const weatherReports: string[] = [];
          if (stadiumResp.docs) {
            for (const s of stadiumResp.docs) {
              try {
                const weather = await sportsStadiumRepository.getStadiumWeather(s._id.toString());
                weatherReports.push(`- Stadium: ${s.name} weather is ${weather.condition}, Temp: ${weather.temperature}, Humidity: ${weather.humidity}`);
              } catch (e) {}
            }
          }
          const weatherStr = weatherReports.length > 0 ? weatherReports.join("\n") : "No live weather available.";

          const matchStr = matchesResp.docs && matchesResp.docs.length > 0
            ? matchesResp.docs.map((m: any) => {
                const liveInfo = m.liveData ? ` (STATUS: ${m.status.toUpperCase()}, SCORE: ${m.liveData.score.home}-${m.liveData.score.away}, MIN: ${m.liveData.minute}', PERIOD: ${m.liveData.period})` : ` (STATUS: Scheduled)`;
                return `- Match: ${m.homeTeam} vs ${m.awayTeam} at ${m.stadiumId?.name || "MetLife Stadium"} on ${new Date(m.date).toLocaleDateString()} (${m.kickoffTime})${liveInfo}`;
              }).join("\n")
            : "No matches scheduled.";
            
          const stadiumStr = stadiumResp.docs && stadiumResp.docs.length > 0
            ? stadiumResp.docs.map((s: any) => `- Stadium ${s.name} (${s.city}), Capacity: ${s.capacity}, Gates: ${(s.gates || []).join(", ")}, Facilities: Wheelchair Ramps, Elevators, High-Contrast Displays`).join("\n")
            : "No stadium layouts listed.";

          return `Upcoming Tournament Matches & Live Scores:\n${matchStr}\n\nTournament Group Standings:\n${standingsStr}\n\nStadium Weather & Conditions:\n${weatherStr}\n\nVenue Accessibility & gates layout:\n${stadiumStr}`;
        }
      }
    } catch (e) {
      console.error(`Failed to build database context for AI feature: ${feature}`, e);
      return "Default World Cup 2026 Stadium Layout: MetLife Stadium, Gate 1, Gate 2, Gate 3, Gate 4. Restrooms are near Section B. Medical first aid rooms near Gate 3.";
    }
  },

  // 2. CENTRALIZED MODEL QUERY CONTROLLER
  async generateCompletion(
    userId: string,
    role: string,
    feature: "chat" | "navigation" | "crowd" | "transport" | "food" | "accessibility" | "emergency",
    language: string,
    prompt: string
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.AI_MODEL || "gemini-2.5-flash";
    const temperature = Number(process.env.AI_TEMPERATURE || 0.7);
    const maxTokens = Number(process.env.AI_MAX_TOKENS || 2048);
    const timeoutVal = Number(process.env.AI_TIMEOUT || 30000);

    // Look up user's active live location
    let locationContext = "";
    try {
      const userLoc = await liveLocationRepository.findOne({ userId, online: true });
      if (userLoc) {
        const uLat = userLoc.latitude;
        const uLng = userLoc.longitude;

        const findNearest = (list: { name: string; lat: number; lng: number }[]) => {
          let nearest = list[0];
          let minDist = getDistanceInMeters(uLat, uLng, nearest.lat, nearest.lng);
          for (let i = 1; i < list.length; i++) {
            const d = getDistanceInMeters(uLat, uLng, list[i].lat, list[i].lng);
            if (d < minDist) {
              minDist = d;
              nearest = list[i];
            }
          }
          return { name: nearest.name, distance: Math.round(minDist) };
        };

        const nearestGate = findNearest(METLIFE_FACILITIES.gates);
        const nearestMedical = findNearest(METLIFE_FACILITIES.medical);
        const nearestFood = findNearest(METLIFE_FACILITIES.food);
        const nearestADA = findNearest(METLIFE_FACILITIES.accessibility);

        locationContext = `
USER CURRENT GEOLOCATION:
- Coordinates: Latitude: ${uLat}, Longitude: ${uLng} (GPS Accuracy: ${userLoc.accuracy}m)
- Nearest Gate: ${nearestGate.name} (~${nearestGate.distance} meters away)
- Nearest Medical Room: ${nearestMedical.name} (~${nearestMedical.distance} meters away)
- Nearest Food Stall: ${nearestFood.name} (~${nearestFood.distance} meters away)
- Nearest Accessible ADA Facility: ${nearestADA.name} (~${nearestADA.distance} meters away)
- Heading/Movement Direction: ${userLoc.heading !== null ? userLoc.heading + "°" : "Unknown"}
- Current Speed: ${userLoc.speed !== null ? userLoc.speed + " m/s" : "Static/Standing"}
- Timestamp of last GPS ping: ${userLoc.updatedAt}

Provide navigation, proximity wayfinding directions, and emergency support instructions using this live user location!
`;
      }
    } catch (e) {
      console.error("Failed to append live location to AI context:", e);
    }

    const context = (await this.buildContext(feature)) + locationContext;
    const systemPrompt = promptTemplates[feature](role, language, context);

    // Increment AI Request Analytics
    try {
      await analyticsService.incrementMetric("AIRequests");
    } catch (e) {
      console.error("Analytics sync failed:", e);
    }

    // FETCH CONVERSATION HISTORY (Last 10 turns for the user & feature)
    const historyDocs = await chatHistoryRepository.find(
      { userId, feature },
      { sort: { timestamp: 1 }, limit: 10 }
    );

    const isGeminiKeyValid = apiKey && apiKey !== "placeholder_gemini_api_key" && apiKey.trim().length > 10;

    // FALLBACK IF GEMINI API KEY IS INVALID OR PLACEHOLDER
    if (!isGeminiKeyValid) {
      console.warn("GEMINI_API_KEY is missing, placeholder, or invalid. Trying OpenAI Fallback...");
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey && !openaiKey.startsWith("your_") && !openaiKey.startsWith("sk-proj-your")) {
        try {
          const messages = [
            { role: "system", content: systemPrompt },
            ...historyDocs.docs.map((chat: any) => ([
              { role: "user", content: chat.prompt },
              { role: "assistant", content: chat.response }
            ])).flat(),
            { role: "user", content: prompt }
          ];

          const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages,
              temperature,
              max_tokens: maxTokens
            })
          });

          if (openaiResponse.ok) {
            const data: any = await openaiResponse.json();
            const aiResponse = data.choices?.[0]?.message?.content;
            if (aiResponse) {
              await chatHistoryRepository.create({
                userId,
                role,
                prompt,
                response: aiResponse,
                feature,
                language,
                timestamp: new Date()
              });
              return aiResponse;
            }
          }
        } catch (openaiErr: any) {
          console.error("OpenAI Fallback Error:", openaiErr.message);
        }
      }

      console.warn("OpenAI fallback also failed or unconfigured. Running Mock AI Fallback...");
      const mockReply = this.generateMockAIResponse(feature, language, prompt, context);
      
      // Save mock query to history database
      await chatHistoryRepository.create({
        userId,
        role,
        prompt,
        response: mockReply,
        feature,
        language,
        timestamp: new Date()
      });
      return mockReply;
    }

    const contents: any[] = [];
    
    // Append history turns
    if (historyDocs.docs && historyDocs.docs.length > 0) {
      historyDocs.docs.forEach((chat: any) => {
        contents.push({ role: "user", parts: [{ text: chat.prompt }] });
        contents.push({ role: "model", parts: [{ text: chat.response }] });
      });
    }

    // Append current user message cleanly
    contents.push({ role: "user", parts: [{ text: prompt }] });

    // EXECUTE HTTP REQUEST WITH RETRY LOGIC
    let attempt = 0;
    const maxAttempts = 3;
    let baseDelay = 1000; // 1s initial delay

    while (attempt < maxAttempts) {
      attempt++;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutVal);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents,
              systemInstruction: systemPrompt ? {
                parts: [{ text: systemPrompt }]
              } : undefined,
              generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
              },
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(id);

        if (!response.ok) {
          const errBody = await response.text();
          // Rate limit status code 429
          if (response.status === 429 && attempt < maxAttempts) {
            console.warn(`Gemini rate limited (429). Retrying attempt ${attempt}...`);
            await new Promise((resolve) => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
            continue;
          }
          throw new Error(`Gemini API HTTP Error (${response.status}): ${errBody}`);
        }

        const data: any = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
          throw new Error("Invalid or empty response format from Gemini API");
        }

        // Save successful query to history database
        await chatHistoryRepository.create({
          userId,
          role,
          prompt,
          response: aiResponse,
          feature,
          language,
          timestamp: new Date()
        });

        return aiResponse;

      } catch (err: any) {
        clearTimeout(id);
        console.error(`Gemini API connection error on attempt ${attempt}:`, err.message);

        if (attempt === maxAttempts) {
          // If all network retries failed, fallback to OpenAI before resorting to Mock AI!
          console.warn("All Gemini API connection attempts failed. Trying OpenAI Fallback...");
          const openaiKey = process.env.OPENAI_API_KEY;
          if (openaiKey && !openaiKey.startsWith("your_") && !openaiKey.startsWith("sk-proj-your")) {
            try {
              const messages = [
                { role: "system", content: systemPrompt },
                ...historyDocs.docs.map((chat: any) => ([
                  { role: "user", content: chat.prompt },
                  { role: "assistant", content: chat.response }
                ])).flat(),
                { role: "user", content: prompt }
              ];
              const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                  model: "gpt-4o-mini",
                  messages,
                  temperature,
                  max_tokens: maxTokens
                })
              });
              if (openaiResponse.ok) {
                const data: any = await openaiResponse.json();
                const aiResponse = data.choices?.[0]?.message?.content;
                if (aiResponse) {
                  await chatHistoryRepository.create({
                    userId,
                    role,
                    prompt,
                    response: aiResponse,
                    feature,
                    language,
                    timestamp: new Date()
                  });
                  return aiResponse;
                }
              }
            } catch (openaiErr: any) {
              console.error("OpenAI Fallback Error:", openaiErr.message);
            }
          }

          console.warn("OpenAI fallback also failed or unconfigured. Falling back to Mock AI...");
          const mockReply = this.generateMockAIResponse(feature, language, prompt, context);
          await chatHistoryRepository.create({
            userId,
            role,
            prompt,
            response: mockReply,
            feature,
            language,
            timestamp: new Date()
          });
          return mockReply;
        }

        // Delay before retry
        await new Promise((resolve) => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
      }
    }

    return "System is currently busy. Please try again shortly.";
  },

  // 3. MOCK RESPONSE GENERATOR (READS DB CONTEXT AND RETRIES CONTEXT-AWARE ANSWERS)
  generateMockAIResponse(feature: string, language: string, prompt: string, context: string): string {
    const input = prompt.toLowerCase();
    
    // Multi-language greetings
    const greetings: Record<string, string> = {
      en: "Hello! I am your World Cup 2026 assistant. ",
      es: "¡Hola! Soy tu asistente de la Copa Mundial 2026. ",
      fr: "Bonjour! Je suis votre assistant pour la Coupe du Monde 2026. ",
      pt: "Olá! Sou seu assistente da Copa do Mundo 2026. ",
      ar: "مرحباً! أنا مساعدك لكأس العالم 2026. ",
      hi: "नमस्ते! मैं २०२६ फीफा विश्व कप के लिए आपका सहायक हूँ। "
    };
    
    const prefix = greetings[language] || greetings.en;

    switch (feature) {
      case "food": {
        if (input.includes("halal")) {
          return `${prefix}\n\n### Recommended Halal Stall\n* **Name**: *Halal Bites*\n* **Location**: Food Court Zone (Near Section B)\n* **Rating**: 4.8 ★\n* **Est. Queue**: 8 mins\n* **Specialty**: Chicken over rice, Falafel wraps.`;
        }
        if (input.includes("vegan") || input.includes("veg")) {
          return `${prefix}\n\n### Recommended Vegan/Vegetarian Stall\n* **Name**: *Green Bowl Organic*\n* **Location**: Section D\n* **Rating**: 4.7 ★\n* **Est. Queue**: 5 mins\n* **Specialty**: Vegan salads, grain bowls, hummus wraps.`;
        }
        return `${prefix}\n\n### Popular Food Stalls Near You\n\n| Stall Name | Location | Queue Time | Rating |\n| :--- | :--- | :--- | :--- |\n| **Burger Palace** | Section C | 5m queue | 4.6 ★ |\n| **Pizza Stadium** | Section B | 10m queue | 4.7 ★ |\n| **Taco Express** | Gate 3 | 3m queue | 4.5 ★ |`;
      }
      
      case "transport": {
        if (input.includes("metro")) {
          return `${prefix}\n\n### 🚇 MetLife Stadium Metro Transit\n* **Route**: Stadium Express Line\n* **Departure**: Transit Plaza (outside **Gate 2**)\n* **Frequency**: Every 4 minutes\n* **Duration**: Active up to 2 hours post-match.`;
        }
        if (input.includes("park") || input.includes("car")) {
          return `${prefix}\n\n### 🚗 Live Parking Lot Occupancy\n* **Zone B**: 124 spots available (Recommended)\n* **Zone C**: **FULL**\n\n*Tip: Book your parking pass via the transport portal immediately to avoid queues.*`;
        }
        return `${prefix}\n\n### 🚌 Fast Exit Transit Recommendations\n* Take the **Stadium Shuttle Bus (Line A)** from **Gate 4** (Zero delays reported).\n* Head to the Rideshare Zone near **Gate 3** for taxi bookings.`;
      }

      case "accessibility": {
        if (input.includes("wheelchair") || input.includes("ramp") || input.includes("lift")) {
          return `${prefix}\n\n### ♿ Accessible Routes & Facilities\n* **Ramps**: Step-free wheelchair ramps are active at all main entrances (**Gates 1, 3, & 4**).\n* **Elevators**: Positioned directly inside **Section B** and **Section C** to access all seating levels.\n* **Assistance**: Contact any volunteer in a blue jersey for immediate escorting.`;
        }
        if (input.includes("hear") || input.includes("deaf") || input.includes("audio")) {
          return `${prefix}\n\n### 🦻 Hearing & Visual Aids\n* **Hearing Loops**: Available at the main Customer Service Desk near **Gate 3**.\n* **Live Commentary**: Tune in to FM Channel **90.5** for real-time match commentary.`;
        }
        return `${prefix}\n\n### ♿ ADA Accessibility Information\n* Dedicated accessible gates are located at **Gate 1, Gate 3, and Gate 4**.\n* Wheelchair-accessible restrooms are located near the Gate 3 lobby.`;
      }

      case "navigation": {
        if (input.includes("washroom") || input.includes("restroom") || input.includes("toilet")) {
          return `${prefix}\n\n### 🚻 Nearest Restroom Directions\n* **Location**: Behind **Section B, Row 10** (approx. 1 min walk).\n* **Accessibility**: Features fully wheelchair-accessible cabins and baby-changing tables.`;
        }
        if (input.includes("exit") || input.includes("leave")) {
          return `${prefix}\n\n### 🚶 Fast Exit Routing\n* Exit via the **Gate 3 staircase**.\n* The walkway is currently clear with very low foot traffic.`;
        }
        return `${prefix}\n\n### 📍 Directions to Section B\n1. Head through **Gate 4**.\n2. Walk straight down the main corridor.\n3. Take the left staircase up to **Section B**.\n\n*Note: Ground volunteers are standing by to guide you.*`;
      }

      case "crowd": {
        if (input.includes("gate 1")) {
          return `${prefix}\n\n### ⚠️ Gate 1 High Congestion Alert\n* **Current Wait Time**: ~22 minutes (Heavy security screening).\n* **Recommendation**: Divert to **Gate 3** (under 3 min wait time).`;
        }
        return `${prefix}\n\n### 📊 Live Gate Congestion Overview\n\n| Entrance Gate | Crowd Level | Est. Wait Time |\n| :--- | :--- | :--- |\n| **Gate 1** | 🔴 High | 20 mins |\n| **Gate 2** | 🟡 Medium | 10 mins |\n| **Gate 3** | 🟢 Low | 2 mins |\n| **Gate 4** | 🟡 Medium | 8 mins |\n\n*Recommendation: Enter via Gate 3 for the fastest access.*`;
      }

      case "emergency": {
        return `${prefix}\n\n### 🚨 EMERGENCY EVACUATION PROCEDURES\n1. **Stay Calm**: Emergency services have been dispatched to your section.\n2. **Nearest Exit**: Proceed to **Gate 3** (assembly point).\n3. **Medical Room**: First Aid room is located near the **Gate 3 lobby**.\n\n*Security Contacts: dial +1 (555) 0100 for dispatch desk.*`;
      }

      case "chat":
      default: {
        if (input.includes("match") || input.includes("schedule") || input.includes("who plays")) {
          return `${prefix}\n\n### 📅 Match Schedule Today\n* **Fixture**: 🇦🇷 Argentina vs 🇫🇷 France\n* **Time**: Kickoff at **8:00 PM**\n* **Gates Open**: 5:00 PM\n* **Venue**: MetLife Stadium`;
        }
        if (input.includes("rule") || input.includes("bag")) {
          return `${prefix}\n\n### 🚫 Stadium Policy Rules\n* **Bags**: Prohibited if larger than **12" x 6" x 12"**. Clear plastic bags are permitted.\n* **Food/Drinks**: Outside food and beverages are not allowed inside the stadium gates.`;
        }
        return `${prefix}\n\nHow can I help you today? You can ask me about:\n* 🗺️ **Navigation**: "Directions to my seat" or "nearest restroom"\n* 🍔 **Food**: "Halal food options" or "find vegan stalls"\n* 🚌 **Transport**: "How to reach the metro" or "parking slots"\n* 📊 **Crowds**: "Gate 1 congestion wait time"`;
      }
    }
  }
};
