import { EntitySchema } from "typeorm";

export const RENOVATION_TYPES = ["oddiy", "yevro"];
export const LISTING_STATUSES = ["active", "rented", "inactive"];
export const SUITABLE_FOR_OPTIONS = ["oila", "talaba", "farqi_yoq"];
export const STUDENT_GENDER_OPTIONS = ["ogil", "qiz", "farqi_yoq"];

export const Listing = new EntitySchema({
  name: "Listing",
  tableName: "listings",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    ownerId: { type: "uuid" },
    // Rasmlar - bir nechta rasm URL manzillari (multer orqali yuklangan)
    images: { type: "text", array: true, default: [] },
    // Manzil - oddiy matn, masalan "Toshkent, Chilonzor, 3 kichik daha"
    address: { type: "varchar", length: 255 },
    renovationType: { type: "enum", enum: RENOVATION_TYPES, default: "oddiy" },
    hasGas: { type: "boolean", default: false },
    hasWater: { type: "boolean", default: false },
    hasElectricity: { type: "boolean", default: false },
    // Texnika-jihoz (mebel, texnika) bor-yo'qligi
    hasFurniture: { type: "boolean", default: false },
    roomCount: { type: "int" },
    // Narx so'mda yoki dollarda bo'lishi mumkin
    price: { type: "int" },
    currency: { type: "enum", enum: ["som", "dollar"], default: "som" },
    // Kim joylayotgani: mulk egasi bevosita, yoki vositachi (rieltor)
    listedBy: { type: "enum", enum: ["owner", "agent"], default: "owner" },
    // Faqat listedBy === "agent" bo'lganda mazmunli
    commissionPercent: { type: "int", nullable: true },

    // Ijara shartlari — kimlarga mos (majburiy tanlanadi)
    suitableFor: { type: "enum", enum: SUITABLE_FOR_OPTIONS, default: "farqi_yoq" },
    // Faqat suitableFor === "oila" bo'lganda mazmunli
    childrenAllowed: { type: "boolean", nullable: true },
    // Faqat suitableFor === "talaba" bo'lganda mazmunli
    studentGender: { type: "enum", enum: STUDENT_GENDER_OPTIONS, nullable: true },
    maxStudents: { type: "int", nullable: true },
    // Ixtiyoriy — null bo'lsa "cheklov aytilmagan" degani
    petsAllowed: { type: "boolean", nullable: true },

    description: { type: "text", nullable: true },
    status: { type: "enum", enum: LISTING_STATUSES, default: "active" },
    createdAt: { type: "timestamp", createDate: true },
    updatedAt: { type: "timestamp", updateDate: true },
  },
  relations: {
    owner: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ownerId" },
      onDelete: "CASCADE",
    },
  },
  indices: [{ columns: ["address"] }],
});