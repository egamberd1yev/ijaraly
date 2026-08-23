import { EntitySchema } from "typeorm";

// Shikoyatlar jadvali. Bitta (reporterId, targetUserId) juftligi faqat
// bir marta bo'lishi mumkin — buni bazaning o'zida unique indeks orqali
// ham majburlaymiz (faqat controller tekshiruviga tayanmaymiz).
export const Report = new EntitySchema({
  name: "Report",
  tableName: "reports",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    reporterId: { type: "uuid" },
    targetUserId: { type: "uuid" },
    reason: { type: "text" },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    reporter: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "reporterId" },
      onDelete: "CASCADE",
    },
    target: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "targetUserId" },
      onDelete: "CASCADE",
    },
  },
  indices: [
    { columns: ["reporterId", "targetUserId"], unique: true },
  ],
});
