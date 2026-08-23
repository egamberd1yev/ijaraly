import { EntitySchema } from "typeorm";

export const NOTIFICATION_TYPES = [
  "report_received", // profilingizga shikoyat tushdi
  "comment_received", // profilingizga izoh yozildi
  "contract_created", // shartnoma tuzildi
  "listing_rented", // e'lon "ijaraga berildi" deb belgilandi
  "listing_expired", // e'lon 7 kundan so'ng avtomatik yopildi
];

export const Notification = new EntitySchema({
  name: "Notification",
  tableName: "notifications",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    userId: { type: "uuid" }, // bildirishnomani oluvchi
    type: { type: "enum", enum: NOTIFICATION_TYPES },
    message: { type: "text" },
    // Ixtiyoriy — e'lon bilan bog'liq bildirishnomalarda tegishli e'longa
    // havola qilish uchun (masalan "E'loningizni ko'rish")
    relatedListingId: { type: "uuid", nullable: true },
    isRead: { type: "boolean", default: false },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
    },
  },
});
