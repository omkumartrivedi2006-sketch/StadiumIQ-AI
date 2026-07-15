import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { notificationService } from "../services/notificationService";
import { apiResponse } from "../utils/apiResponse";
import { notificationRepository } from "../repositories/notificationRepository";
import { emitEvent } from "../utils/socket";

export const notificationController = {
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        apiResponse.error(res, "Not authenticated", [], 401);
        return;
      }
      
      const result = await notificationService.getNotificationsByUserId(req.user.id);
      apiResponse.success(res, "Notifications retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve notifications");
    }
  },

  async createNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notif = await notificationService.createNotification(req.body);

      // Emit real-time notification socket event
      if (notif.userId) {
        emitEvent("new-notification", notif);
      } else if (notif.targetRole) {
        emitEvent("new-notification", notif, notif.targetRole);
      } else {
        emitEvent("new-notification", notif);
      }

      apiResponse.success(res, "Notification created successfully", notif, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to create notification");
    }
  },

  async updateNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notif = await notificationService.updateNotification(req.params.id, req.body);
      if (!notif) {
        apiResponse.error(res, "Notification not found", [], 404);
        return;
      }
      apiResponse.success(res, "Notification updated successfully", notif);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update notification");
    }
  },

  async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        apiResponse.error(res, "Not authenticated", [], 401);
        return;
      }
      const notifToCheck = await notificationRepository.findById(req.params.id);
      if (!notifToCheck) {
        apiResponse.error(res, "Notification not found", [], 404);
        return;
      }
      // Check if user is admin/organizer OR if it is their own notification
      if (
        req.user.role !== "admin" &&
        req.user.role !== "organizer" &&
        notifToCheck.userId?.toString() !== req.user.id
      ) {
        apiResponse.error(res, "Unauthorized to delete this notification", [], 403);
        return;
      }
      const notif = await notificationService.deleteNotification(req.params.id);
      apiResponse.success(res, "Notification deleted successfully", notif);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to delete notification");
    }
  },
};
