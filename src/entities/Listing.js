const { EntitySchema } = require("typeorm");

const RENOVATION_TYPES = ["oddiy", "yevro"];
const LISTING_STATUSES = ["active", "rented", "inactive"];

const Listing = new EntitySchema({
  name: "Listing",
  tableName: "listings",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    ownerId: {
      type: "uuid",
    },
    // Rasmlar - bir nechta rasm URL manzillari (multer orqali yuklangan)
    images: {
      type: "text",
      array: true,
      default: [],
    },
    // Manzil - oddiy matn, masalan "Toshkent, Chilonzor, 3 kichik daha"
    address: {
      type: "varchar",
      length: 255,
    },
    renovationType: {
      type: "enum",
      enum: RENOVATION_TYPES,
      default: "oddiy",
    },
    hasGas: {
      type: "boolean",
      default: false,
    },
    hasWater: {
      type: "boolean",
      default: false,
    },
    hasElectricity: {
      type: "boolean",
      default: false,
    },
    // Texnika-jihoz (mebel, texnika) bor-yo'qligi
    hasFurniture: {
      type: "boolean",
      default: false,
    },
    roomCount: {
      type: "int",
    },
    // Narx so'mda, oylik ijara narxi
    price: {
      type: "int",
    },
    description: {
      type: "text",
      nullable: true,
    },
    status: {
      type: "enum",
      enum: LISTING_STATUSES,
      default: "active",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
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

module.exports = { Listing, RENOVATION_TYPES, LISTING_STATUSES };