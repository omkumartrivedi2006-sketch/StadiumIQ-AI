import { apiClient } from "../api/client";

export interface SOSAlert {
  id: string;
  userId?: string;
  userRole?: string;
  location: string;
  timestamp: Date;
  status: "active" | "pending" | "resolved";
}

export const emergencyService = {
  async triggerSOS(location: string): Promise<SOSAlert> {
    try {
      const response = await apiClient.post("/sos", {
        location,
        emergencyType: "General Emergency",
      });
      if (response.data?.success && response.data?.data) {
        const item = response.data.data;
        return {
          id: item._id,
          userId: item.userId,
          location: item.location,
          timestamp: new Date(item.createdAt),
          status: item.status,
        };
      }
    } catch (e) {
      console.error("Failed to post SOS to backend:", e);
    }
    // Fallback
    return {
      id: Math.random().toString(36).substr(2, 9),
      location,
      timestamp: new Date(),
      status: "active",
    };
  },

  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const response = await apiClient.put(`/sos/${alertId}`, { status: "resolved" });
      return response.data?.success === true;
    } catch (e) {
      console.error("Failed to resolve SOS alert on backend:", e);
      return false;
    }
  },

  async getActiveAlerts(): Promise<SOSAlert[]> {
    try {
      const response = await apiClient.get("/sos?status=active");
      if (response.data?.success && response.data?.data?.docs) {
        return response.data.data.docs.map((item: any) => ({
          id: item._id,
          userId: item.userId?._id || item.userId,
          userRole: item.userId?.role || "fan",
          location: item.location,
          timestamp: new Date(item.createdAt),
          status: item.status,
        }));
      }
    } catch (e) {
      console.error("Failed to fetch active SOS alerts:", e);
    }
    return [];
  },
};
