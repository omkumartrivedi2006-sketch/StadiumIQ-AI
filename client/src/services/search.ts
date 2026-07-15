import { apiClient } from "../api/client";

export interface SearchResults {
  matches: any[];
  stadiums: any[];
  foodVendors: any[];
  transport: any[];
  users: any[];
}

export const searchService = {
  async search(query: string): Promise<SearchResults> {
    try {
      const response = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch (e) {
      console.error("Failed to query search API:", e);
    }
    return {
      matches: [],
      stadiums: [],
      foodVendors: [],
      transport: [],
      users: []
    };
  }
};
