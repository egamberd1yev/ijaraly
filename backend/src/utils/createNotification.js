import { AppDataSource } from "../config/data-source.js";
import { Notification } from "../entities/Notification.js";

export async function createNotification({ userId, type, message, relatedListingId = null }) {
  const repo = AppDataSource.getRepository(Notification);
  const notification = repo.create({ userId, type, message, relatedListingId });
  await repo.save(notification);
  return notification;
}
