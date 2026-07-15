import { apiClient } from "../api/client";

export interface LostItem {
  id: number;
  _id?: string;
  description: string;
  location: string;
  reportedTime: string;
  status: "found" | "pending" | "claimed";
  color?: string;
}

export const lostFoundService = {
  async getLostItems(): Promise<LostItem[]> {
    try {
      const response = await apiClient.get("/lost-found");
      if (response.data?.success && response.data?.data?.docs) {
        return response.data.data.docs.map((item: any, idx: number) => {
          // Format times: "2 hours ago", "1 hour ago", etc.
          const hrs = Math.round((Date.now() - new Date(item.reportedTime).getTime()) / (1000 * 60 * 60));
          const timeStr = hrs <= 0 ? "Just now" : `${hrs} hour${hrs > 1 ? "s" : ""} ago`;

          return {
            id: idx + 1,
            _id: item._id,
            description: item.description,
            location: item.location,
            reportedTime: timeStr,
            status: item.status,
            color: item.color,
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch lost items from backend:", e);
    }
    return [
      { id: 1, description: "Blue backpack with laptop", location: "Gate 2", reportedTime: "2 hours ago", status: "pending", color: "Blue" },
      { id: 2, description: "Red baseball cap", location: "Section A", reportedTime: "1 hour ago", status: "found", color: "Red" },
      { id: 3, description: "Black wallet with ID", location: "Gate 5", reportedTime: "30 minutes ago", status: "pending", color: "Black" },
      { id: 4, description: "White headphones", location: "Section C", reportedTime: "45 minutes ago", status: "claimed", color: "White" },
    ];
  },

  async reportLostItem(description: string, location: string, color?: string): Promise<boolean> {
    try {
      const response = await apiClient.post("/lost-found", {
        description,
        location,
        color,
      });
      return response.data?.success === true;
    } catch (e) {
      console.error("Failed to report lost item:", e);
      return false;
    }
  },

  async updateItemStatus(itemId: string, status: "pending" | "found" | "claimed"): Promise<boolean> {
    try {
      const response = await apiClient.put(`/lost-found/${itemId}`, { status });
      return response.data?.success === true;
    } catch (e) {
      console.error("Failed to update item status:", e);
      return false;
    }
  },
};
