import { lostFoundRepository } from "../repositories/lostFoundRepository";

export const lostFoundService = {
  async getAllItems(filter: any, options: any) {
    return lostFoundRepository.find(filter, options);
  },

  async reportItem(data: any) {
    return lostFoundRepository.create(data);
  },

  async updateItemStatus(id: string, status: "pending" | "found" | "claimed") {
    return lostFoundRepository.update(id, { status });
  },
};
