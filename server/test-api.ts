import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

async function testAPI() {
  console.log("Starting automated REST API Verification...");
  
  try {
    // 1. Test Login API
    console.log("\nTesting POST /api/auth/login...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: "john.doe@fifa.com",
      password: "Password123!",
    });
    
    if (loginResponse.data?.success && loginResponse.data?.accessToken) {
      console.log("✓ Login successful!");
      console.log("Logged In User Name:", loginResponse.data.user.fullName);
      console.log("Token received:", loginResponse.data.accessToken.substring(0, 30) + "...");
    } else {
      console.error("✗ Login failed:", loginResponse.data);
      process.exit(1);
    }
    
    const token = loginResponse.data.accessToken;
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // 2. Test profile API
    console.log("\nTesting GET /api/auth/profile...");
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, authHeaders);
    if (profileResponse.data?.success) {
      console.log("✓ Profile retrieved successfully!");
      console.log("Profile Country:", profileResponse.data.user.country);
    } else {
      console.error("✗ Profile failed:", profileResponse.data);
    }

    // 3. Test stadiums API
    console.log("\nTesting GET /api/stadiums...");
    const stadiumsResponse = await axios.get(`${BASE_URL}/stadiums`, authHeaders);
    if (stadiumsResponse.data?.success && stadiumsResponse.data?.data?.docs) {
      console.log("✓ Stadiums retrieved successfully!");
      console.log("Stadium Name:", stadiumsResponse.data.data.docs[0]?.name);
      console.log("Gates List:", stadiumsResponse.data.data.docs[0]?.gates);
    } else {
      console.error("✗ Stadiums failed:", stadiumsResponse.data);
    }

    // 4. Test matches API
    console.log("\nTesting GET /api/matches...");
    const matchesResponse = await axios.get(`${BASE_URL}/matches`, authHeaders);
    if (matchesResponse.data?.success && matchesResponse.data?.data?.docs) {
      console.log("✓ Matches retrieved successfully!");
      console.log("Match:", matchesResponse.data.data.docs[0]?.homeTeam, "vs", matchesResponse.data.data.docs[0]?.awayTeam);
    } else {
      console.error("✗ Matches failed:", matchesResponse.data);
    }

    // 5. Test food vendors API
    console.log("\nTesting GET /api/food...");
    const foodResponse = await axios.get(`${BASE_URL}/food`, authHeaders);
    if (foodResponse.data?.success && foodResponse.data?.data?.docs) {
      console.log("✓ Food vendors retrieved successfully!");
      console.log("Vendor list:", foodResponse.data.data.docs.map((v: any) => v.vendorName));
    } else {
      console.error("✗ Food failed:", foodResponse.data);
    }

    // 6. Test transportation API
    console.log("\nTesting GET /api/transport...");
    const transportResponse = await axios.get(`${BASE_URL}/transport`, authHeaders);
    if (transportResponse.data?.success && transportResponse.data?.data?.docs) {
      console.log("✓ Transportation options retrieved successfully!");
      console.log("Transport counts:", transportResponse.data.data.docs[0]?.options?.length);
    } else {
      console.error("✗ Transport failed:", transportResponse.data);
    }

    // 7. Test SOS API
    console.log("\nTesting POST /api/sos...");
    const sosResponse = await axios.post(
      `${BASE_URL}/sos`,
      {
        location: "Section B - Row 12",
        emergencyType: "Medical Help",
      },
      authHeaders
    );
    if (sosResponse.data?.success) {
      console.log("✓ SOS trigger reported successfully!");
      console.log("SOS Alert status:", sosResponse.data.data.status);
    } else {
      console.error("✗ SOS trigger failed:", sosResponse.data);
    }

    // 8. Test notifications API
    console.log("\nTesting GET /api/notifications...");
    const notifResponse = await axios.get(`${BASE_URL}/notifications`, authHeaders);
    if (notifResponse.data?.success && Array.isArray(notifResponse.data.data.docs)) {
      console.log("✓ Notifications retrieved successfully!");
      console.log("Announcements list:", notifResponse.data.data.docs.map((n: any) => n.title));
    } else {
      console.error("✗ Notifications failed:", notifResponse.data);
    }

    console.log("\n✓ All API tests completed successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("✗ API test failure:", error.message || error);
    if (error.response) {
      console.error("Response details:", error.response.data);
    }
    process.exit(1);
  }
}

testAPI();
