import { EntitySchema } from "typeorm";

export const Contract = new EntitySchema({
  name: "Contract",
  tableName: "contracts",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    listingId: { type: "uuid" },
    ownerId: { type: "uuid" },
    address: { type: "varchar", length: 255 },
    monthlyPrice: { type: "int" },
    currency: { type: "enum", enum: ["som", "dollar"] },
    renterFullName: { type: "varchar", length: 150 },
    renterPassport: { type: "varchar", length: 50 },
    renterPhone: { type: "varchar", length: 20, nullable: true },
    startDate: { type: "date" },
    endDate: { type: "date" },
    // Cloudinary'dagi to'liq havola (avval "pdfFilename" — lokal fayl
    // nomi — edi, endi to'g'ridan-to'g'ri to'liq URL saqlanadi)
    pdfUrl: { type: "varchar" },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    listing: {
      type: "many-to-one",
      target: "Listing",
      joinColumn: { name: "listingId" },
      onDelete: "CASCADE",
    },
    owner: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ownerId" },
      onDelete: "CASCADE",
    },
  },
});