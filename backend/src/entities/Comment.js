import { EntitySchema } from "typeorm";

// Ommaviy izohlar — profilga kirgan har bir kishi ko'radi.
// Bitta (authorId, targetUserId) juftligi faqat bir marta bo'lishi mumkin.
export const Comment = new EntitySchema({
  name: "Comment",
  tableName: "comments",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    authorId: { type: "uuid" },
    targetUserId: { type: "uuid" },
    text: { type: "text" },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    author: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "authorId" },
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
    { columns: ["authorId", "targetUserId"], unique: true },
  ],
});
