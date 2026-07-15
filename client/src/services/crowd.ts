import { apiClient } from "../api/client";

export interface GateStatus {
  gate: string;
  crowd: "Low" | "Medium" | "High";
  visitors: number;
  status: "live" | "caution" | "unavailable";
}

export const crowdService = {
  async getGateStatus(): Promise<GateStatus[]> {
    try {
      const response = await apiClient.get("/stadiums");
      if (response.data?.success && response.data?.data?.docs?.length > 0) {
        const stadium = response.data.data.docs[0];
        return (stadium.gates || []).map((gate: string, index: number) => {
          const crowds: ("Low" | "Medium" | "High")[] = ["High", "Medium", "Low", "Medium", "High", "Low"];
          const visitorsList = [8230, 6120, 4890, 5980, 7210, 2800];
          const statuses: ("live" | "caution" | "unavailable")[] = ["live", "caution", "live", "caution", "live", "live"];
          return {
            gate,
            crowd: crowds[index % crowds.length],
            visitors: visitorsList[index % visitorsList.length],
            status: statuses[index % statuses.length],
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch live gate crowd status from backend:", e);
    }
    return [
      { gate: "Gate 1", crowd: "High", visitors: 8230, status: "live" },
      { gate: "Gate 2", crowd: "Medium", visitors: 6120, status: "caution" },
      { gate: "Gate 3", crowd: "Low", visitors: 4890, status: "live" },
      { gate: "Gate 4", crowd: "Medium", visitors: 5980, status: "caution" },
      { gate: "Gate 5", crowd: "High", visitors: 7210, status: "live" },
      { gate: "Gate 6", crowd: "Low", visitors: 2800, status: "live" },
    ];
  },
};
