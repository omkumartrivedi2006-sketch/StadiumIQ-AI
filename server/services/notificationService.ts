import { notificationRepository } from "../repositories/notificationRepository";

export const notificationService = {
  async getAllNotifications(filter: any, options: any) {
    return notificationRepository.find(filter, options);
  },

  async getNotificationsByUserId(userId: string) {
    // Return targeted notifications + global announcements
    return notificationRepository.find(
      {
        $or: [{ userId }, { userId: null }],
      },
      { sort: { timestamp: -1 }, limit: 50 }
    );
  },

  async createNotification(data: any) {
    return notificationRepository.create(data);
  },

  async updateNotification(id: string, data: any) {
    return notificationRepository.update(id, data);
  },

  async deleteNotification(id: string) {
    return notificationRepository.delete(id);
  },
};
