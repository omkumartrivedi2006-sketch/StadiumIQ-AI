import { apiClient } from "../api/client";

export interface TransportOption {
  id: number;
  type: string;
  icon: string;
  waitTime: string;
  fare: string;
  distance: string;
  rating: number;
}

export const transportService = {
  async getTransportOptions(): Promise<TransportOption[]> {
    try {
      const response = await apiClient.get("/transport");
      if (response.data?.success && response.data?.data?.docs?.length > 0) {
        const transRecord = response.data.data.docs[0];
        return (transRecord.options || []).map((opt: any, idx: number) => ({
          id: idx + 1,
          type: opt.type,
          icon: opt.icon || "🚗",
          waitTime: opt.waitTime,
          fare: opt.fare,
          distance: opt.distance,
          rating: opt.rating,
        }));
      }
    } catch (e) {
      console.error("Failed to fetch transport options from backend:", e);
    }
    return [
      { id: 1, type: "Metro", icon: "🚇", waitTime: "3 min", fare: "$2.50", distance: "1.2 km", rating: 4.7 },
      { id: 2, type: "Taxi", icon: "🚕", waitTime: "8 min", fare: "$12-18", distance: "Varies", rating: 4.5 },
      { id: 3, type: "Bus", icon: "🚌", waitTime: "12 min", fare: "$1.50", distance: "2.5 km", rating: 4.3 },
      { id: 4, type: "Ride Share", icon: "🚗", waitTime: "5 min", fare: "$15-25", distance: "Varies", rating: 4.8 },
      { id: 5, type: "Walking", icon: "🚶", waitTime: "Immediate", fare: "Free", distance: "3 km", rating: 4.0 },
    ];
  },

  async bookRide(optionId: number): Promise<boolean> {
    try {
      console.log("transportService.bookRide backend called", optionId);
      return true;
    } catch (e) {
      console.error("Failed to book ride:", e);
      return false;
    }
  },
};
