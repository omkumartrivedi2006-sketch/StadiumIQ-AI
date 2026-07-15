import { BaseRepository } from "./baseRepository";
import { Notification } from "../models/Notification";

export class NotificationRepository extends BaseRepository<any> {
  constructor() {
    super(Notification);
  }
}

export const notificationRepository = new NotificationRepository();
