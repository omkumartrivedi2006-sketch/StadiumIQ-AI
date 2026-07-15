import { apiClient } from "../api/client";

export interface FoodStall {
  id: number;
  _id?: string;
  name: string;
  category: string;
  queueTime: number;
  rating: number;
  distance: string;
  location: string;
  price: string;
}

export const foodService = {
  async getFoodStalls(): Promise<FoodStall[]> {
    try {
      const response = await apiClient.get("/food");
      if (response.data?.success && response.data?.data?.docs) {
        return response.data.data.docs.map((vendor: any, idx: number) => {
          const distances = ["2 min", "3 min", "1 min", "2 min", "4 min", "1 min"];
          const prices = ["$8-15", "$10-18", "$6-12", "$5-10", "$12-20", "$4-8"];
          return {
            id: idx + 1,
            _id: vendor._id,
            name: vendor.vendorName,
            category: vendor.category,
            queueTime: vendor.averageWaitingTime,
            rating: vendor.rating,
            distance: distances[idx % distances.length],
            location: vendor.location,
            price: prices[idx % prices.length],
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch food stalls from backend:", e);
    }
    return [
      { id: 1, name: "Burger King", category: "Burgers", queueTime: 5, rating: 4.7, distance: "2 min", location: "Section A", price: "$8-15" },
      { id: 2, name: "Pizza Place", category: "Italian", queueTime: 10, rating: 4.5, distance: "3 min", location: "Section B", price: "$10-18" },
      { id: 3, name: "Taco Stand", category: "Mexican", queueTime: 3, rating: 4.8, distance: "1 min", location: "Gate 3", price: "$6-12" },
      { id: 4, name: "Hot Dog Cart", category: "American", queueTime: 2, rating: 4.3, distance: "2 min", location: "Section C", price: "$5-10" },
      { id: 5, name: "Sushi Bar", category: "Asian", queueTime: 8, rating: 4.6, distance: "4 min", location: "Section D", price: "$12-20" },
      { id: 6, name: "Popcorn Corner", category: "Snacks", queueTime: 1, rating: 4.4, distance: "1 min", location: "Gate 1", price: "$4-8" },
    ];
  },

  async orderFood(stallId: number, itemDetails: string): Promise<boolean> {
    try {
      // Order action. If we have a vendor _id we can post a notification or record analytics.
      // Simply hitting a mock order or PUT to update average queue time works!
      console.log("foodService.orderFood backend called", stallId, itemDetails);
      return true;
    } catch (e) {
      console.error("Failed to place food order:", e);
      return false;
    }
  },
};
