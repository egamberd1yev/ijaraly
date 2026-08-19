import { EntitySchema } from "typeorm";

// Ijara shartnomalari jadvali.
// Diqqat: address/monthlyPrice/currency shartnoma tuzilgan paytdagi
// qiymatning "nusxasi" (snapshot) sifatida saqlanadi — chunki e'lonning
// o'zi keyinchalik tahrirlanishi yoki o'chirilishi mumkin, lekin
// shartnoma tuzilgan paytdagi shartlar o'zgarmasdan qolishi kerak.
export const Contract = new EntitySchema({
  name: "Contract",
  tableName: "contracts",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    listingId: {
      type: "uuid",
    },
    ownerId: {
      type: "uuid",
    },

    // Shartnoma tuzilgan paytdagi e'lon ma'lumotlari (nusxa)
    address: { type: "varchar", length: 255 },
    monthlyPrice: { type: "int" },
    currency: { type: "enum", enum: ["som", "dollar"] },

    // Ijarachi ma'lumotlari — egasi tomonidan qo'lda kiritiladi
    renterFullName: { type: "varchar", length: 150 },
    renterPassport: { type: "varchar", length: 50 },
    renterPhone: { type: "varchar", length: 20, nullable: true },

    // Ikki tomon kelishgan muddat
    startDate: { type: "date" },
    endDate: { type: "date" },

    // Yaratilgan PDF fayl nomi (uploads/contracts papkasida)
    pdfFilename: { type: "varchar" },

    createdAt: {
      type: "timestamp",
      createDate: true,
    },
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