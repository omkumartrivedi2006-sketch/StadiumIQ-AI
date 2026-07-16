import axios from "axios";

async function run() {
  try {
    console.log("Checking server connection on http://localhost:5000/api/auth/login...");
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: "john.doe@fifa.com",
      password: "Password123!"
    }, { timeout: 2000 });
    console.log("Response:", res.status, res.data);
  } catch (err: any) {
    console.error("Error occurred:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
    }
  }
}

run();
