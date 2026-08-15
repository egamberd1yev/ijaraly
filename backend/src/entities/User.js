const { EntitySchema } = require("typeorm");

// Foydalanuvchi jadvali.
// Diqqat: bu yerda qattiq "role" maydoni yo'q — har bir user xohlasa
// ijarachi (e'lon egasi), xohlasa qidiruvchi bo'la oladi. E'lon qo'yganda
// u avtomatik shu e'lonning egasi hisoblanadi.
//
// socialLinks tuzilishi: { instagram: { username, url }, telegram: {...}, facebook: {...} }
const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    fullName: {
      type: "varchar",
      length: 100,
    },
    email: {
      type: "varchar",
      length: 100,
      unique: true,
    },
    phone: {
      type: "varchar",
      length: 20,
      unique: true,
      nullable: true,
    },
    passwordHash: {
      type: "varchar",
    },
    // Ijtimoiy tarmoq linklari: { instagram, telegram, facebook }
    socialLinks: {
      type: "jsonb",
      nullable: true,
      default: {},
    },
    avatarUrl: {
      type: "varchar",
      nullable: true,
    },
    // Foydalanuvchi shartlar va qoidalarga qachon rozilik bildirgani
    // (huquqiy jihatdan dalil sifatida saqlanadi)
    termsAcceptedAt: {
      type: "timestamp",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    listings: {
      type: "one-to-many",
      target: "Listing",
      inverseSide: "owner",
    },
  },
});

module.exports = { User };