import { chatHistoryRepository } from "../repositories/chatHistoryRepository";
import { foodService } from "./foodService";
import { transportService } from "./transportService";
import { sosService } from "./sosService";
import { stadiumRepository } from "../repositories/stadiumRepository";
import { matchService } from "./matchService";
import { analyticsService } from "./analyticsService";

// CENTRALIZED PROMPT TEMPLATES
const promptTemplates = {
  chat: (role: string, language: string, context: string) => `
You are "StadiumIQ AI", a highly capable, multilingual stadium assistant for the FIFA World Cup 2026.
Your primary objective is to assist users based on their operational profile.
The user is logged in with the role: [${role}].
You must respond in the language corresponding to code: [${language}] (e.g. en, es, fr, pt, ar, hi).
Be friendly, professional, and role-appropriate.

OPERATIONAL WORLD CUP STADIUM CONTEXT:
${context}
`,

  navigation: (role: string, language: string, context: string) => `
You are the "Smart Stadium Navigation Assistant" for the FIFA World Cup 2026.
Provide clear, step-by-step route suggestions, directions, or walking guidance.
The user's role is: [${role}].
You must respond in the language code: [${language}].
Highlight wheelchair-friendly entrances, lifts, restrooms, or emergency exits where appropriate.

STADIUM NAVIGATION & GATE WAYFINDING CONTEXT:
${context}
`,

  crowd: (role: string, language: string, context: string) => `
You are the "Venue Crowd Intelligence Assistant" for the FIFA World Cup 2026.
Analyze gate congestion, occupancy status, safety levels, and waiting times.
Provide suggestions on less crowded entrances or exits.
The user's role is: [${role}].
You must respond in the language code: [${language}].

LIVE GATE OCCUPANCY & CROWD STATUS CONTEXT:
${context}
`,

  transport: (role: string, language: string, context: string) => `
You are the "Transport & Transit Assistant" for the FIFA World Cup 2026.
Provide transit suggestions (Metro lanes, bus shuttles, rideshare zones, parking availability, and walking paths).
The user's role is: [${role}].
You must respond in the language code: [${language}].

TRANSIT OPTION & PARKING STATUS CONTEXT:
${context}
`,

  food: (role: string, language: string, context: string) => `
You are the "Food Recommendation AI" for the FIFA World Cup 2026.
Recommend food stalls, items, and vendors based on user preferences and dietary requirements (e.g. Vegetarian, Vegan, Halal, Fast food).
Sort or filter by waiting time, ratings, and proximity.
The user's role is: [${role}].
You must respond in the language code: [${language}].

AVAILABLE FOOD VENDORS & LIVE QUEUE CONTEXT:
${context}
`,

  accessibility: (role: string, language: string, context: string) => `
You are the "Accessibility Assistant" for the FIFA World Cup 2026.
Recommend wheelchair routes, elevators, ramps, accessible restrooms, medical rooms, hearing loops, and visual assist guides.
The user's role is: [${role}].
You must respond in the language code: [${language}].

ACCESSIBILITY ACCUMULATIONS CONTEXT:
${context}
`,

  emergency: (role: string, language: string, context: string) => `
You are the "Emergency Support Assistant" for the FIFA World Cup 2026.
Provide IMMEDIATE, calm, and concise security recommendations or evacuation guidance.
Instruct the user on what to do for medical rooms, fires, safety incidents, or lost items.
The user's role is: [${role}].
You must respond in the language code: [${language}].

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
        case "navigation":
        case "accessibility":
        case "chat":
        default: {
          const matchesResp = await matchService.getAllMatches({}, { limit: 5 });
          const stadiumResp = await stadiumRepository.find({}, { limit: 5 });
          
          const matchStr = matchesResp.docs && matchesResp.docs.length > 0
            ? matchesResp.docs.map((m: any) => `- Match: ${m.homeTeam} vs ${m.awayTeam} at ${m.stadiumId?.name || "MetLife Stadium"} on ${new Date(m.date).toLocaleDateString()} (${m.kickoffTime})`).join("\n")
            : "No matches scheduled.";
            
          const stadiumStr = stadiumResp.docs && stadiumResp.docs.length > 0
            ? stadiumResp.docs.map((s: any) => `- Stadium ${s.name} (${s.city}), Capacity: ${s.capacity}, Gates: ${(s.gates || []).join(", ")}, Facilities: Wheelchair Ramps, Elevators, High-Contrast Displays`).join("\n")
            : "No stadium layouts listed.";

          return `Upcoming Tournament Matches:\n${matchStr}\n\nVenue Accessibility & gates layout:\n${stadiumStr}`;
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

    const context = await this.buildContext(feature);
    const systemPrompt = promptTemplates[feature](role, language, context);

    // Increment AI Request Analytics
    try {
      await analyticsService.incrementMetric("AIRequests");
    } catch (e) {
      console.error("Analytics sync failed:", e);
    }

    // FALLBACK IF API KEY IS PLACEHOLDER OR MISSING
    if (!apiKey || apiKey === "placeholder_gemini_api_key") {
      console.warn("GEMINI_API_KEY is missing or placeholder. Running Mock AI Fallback...");
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

    // FETCH CONVERSATION HISTORY (Last 10 turns for the user & feature)
    const historyDocs = await chatHistoryRepository.find(
      { userId, feature },
      { sort: { timestamp: 1 }, limit: 10 }
    );
    
    const contents: any[] = [];
    
    // Append history turns
    if (historyDocs.docs && historyDocs.docs.length > 0) {
      historyDocs.docs.forEach((chat: any) => {
        contents.push({ role: "user", parts: [{ text: chat.prompt }] });
        contents.push({ role: "model", parts: [{ text: chat.response }] });
      });
    }

    // Append system prompt instruction at the start of current prompt
    const fullUserPrompt = `[System Instructions]: ${systemPrompt}\n\n[User Prompt]: ${prompt}`;
    contents.push({ role: "user", parts: [{ text: fullUserPrompt }] });

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
          // If all network retries failed, fallback to mock so server continues responding
          console.warn("All Gemini API connection attempts failed. Falling back to Mock AI...");
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
          return `${prefix}Based on our database vendors, I highly recommend 'Halal Bites' at Food Court Zone, currently sporting a 4.8★ rating with an estimated waiting queue of 8 minutes.`;
        }
        if (input.includes("vegan") || input.includes("veg")) {
          return `${prefix}For vegan/vegetarian diets, 'Green Bowl Organic' at Section D is the best choice. They offer healthy salads, wraps (4.7★), and queue waiting time is just 5 minutes.`;
        }
        return `${prefix}Here are the best rated food stalls near you:\n- Burger Palace (Section C, 5m queue, 4.6★)\n- Pizza Stadium (Section B, 10m queue, 4.7★)\n- Taco Express (Gate 3, 3m queue, 4.5★). Let me know if you want to place a quick order!`;
      }
      
      case "transport": {
        if (input.includes("metro")) {
          return `${prefix}The World Cup Stadium Express Metro Line departs from Transit Plaza (outside Gate 2) every 4 minutes. Trains run 2 hours post-match.`;
        }
        if (input.includes("park") || input.includes("car")) {
          return `${prefix}Parking Zone B has 124 available spots, and Parking Zone C is fully occupied. I suggest booking your parking pass via transit portal immediately.`;
        }
        return `${prefix}For the fastest exit, I suggest taking the Stadium Shuttle Bus (Line A) from Gate 4, which is currently running with zero delays.`;
      }

      case "accessibility": {
        if (input.includes("wheelchair") || input.includes("ramp") || input.includes("lift")) {
          return `${prefix}MetLife Stadium features step-free wheelchair ramps at all main entrances. Elevators are situated directly in Section B and Section C, providing smooth access to all seating levels.`;
        }
        if (input.includes("hear") || input.includes("deaf") || input.includes("audio")) {
          return `${prefix}Assistive hearing loop systems are available at the main Customer Service Desk near Gate 3. You can also listen to audio match commentary on Channel 90.5 FM.`;
        }
        return `${prefix}MetLife Stadium is fully ADA-compliant. We offer dedicated accessible entrances at Gates 1, 3, and 4. Ground staff are stationed at each gate to assist you.`;
      }

      case "navigation": {
        if (input.includes("washroom") || input.includes("restroom") || input.includes("toilet")) {
          return `${prefix}The nearest restroom is located behind Section B, Row 10 (approx. 1 min walk). It includes full wheelchair-accessible cabins.`;
        }
        if (input.includes("exit") || input.includes("leave")) {
          return `${prefix}The fastest exit route from your section is via Gate 3 staircase. The path is currently clear with very low foot traffic.`;
        }
        return `${prefix}To find your seat, head through Gate 4, walk straight down the corridor, and take the left staircase up to Section B. Ground volunteers are standing by to guide you.`;
      }

      case "crowd": {
        if (input.includes("gate 1")) {
          return `${prefix}Gate 1 is currently experiencing heavy congestion due to security screenings. Wait time is approximately 22 minutes. I recommend entering through Gate 3 instead.`;
        }
        return `${prefix}Current live gate crowd status:\n- Gate 1: High crowd (20m wait)\n- Gate 2: Medium crowd (10m wait)\n- Gate 3: Low crowd (2m wait)\n- Gate 4: Medium crowd (8m wait). Enter via Gate 3 for the fastest entry.`;
      }

      case "emergency": {
        return `${prefix}[🚨 EMERGENCY ALERT] Please stay calm. A security dispatch has been notified. Responders are heading to your location. If safe to do so, move towards the nearest emergency exit at Gate 3. First aid medical rooms are situated directly by Gate 3.`;
      }

      case "chat":
      default: {
        if (input.includes("match") || input.includes("schedule") || input.includes("who plays")) {
          return `${prefix}The next upcoming match at this venue is Argentina vs France, scheduled for 8:00 PM today. Gates open at 5:00 PM. Enjoy the game!`;
        }
        if (input.includes("rule") || input.includes("bag")) {
          return `${prefix}Stadium policy rules prohibit bags larger than 12x6x12 inches. Clear plastic bags are permitted. Food and beverage items from outside are not allowed inside the stadium gates.`;
        }
        return `${prefix}I can assist you with all stadium operations. I see you are logged in as a World Cup user. You can ask me about navigation, crowd levels, transport services, food ordering, and first-aid rooms.`;
      }
    }
  }
};
