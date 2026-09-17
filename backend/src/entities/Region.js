import { EntitySchema } from "typeorm";

// O'zbekiston viloyatlari, shaharlari va respublikasi ro'yxati
// TypeORM orqali DB ga sync bo'ladi, zarur bo'lsa seed.js bilan ham to'ldirish mumkin

export const REGIONS = [
  { id: "toshkent-viloyat", name: "Toshkent viloyati", type: "viloyat" },
  { id: "tashkent-city", name: "Toshkent shahri", type: "shahar" },
  { id: "sirdaryo", name: "Sirdaryo viloyati", type: "viloyat" },
  { id: "jizzakh", name: "Jizzax viloyati", type: "viloyat" },
  { id: "surxondaryo", name: "Surxondaryo viloyati", type: "viloyat" },
  { id: "namangan", name: "Namangan viloyati", type: "viloyat" },
  { id: "fergana", name: "Farg'ona viloyati", type: "viloyat" },
  { id: "bukhara", name: "Buxoro viloyati", type: "viloyat" },
  { id: "khorezm", name: "Xorazm viloyati", type: "viloyat" },
  { id: "qashqadaryo", name: "Qashqadaryo viloyati", type: "viloyat" },
  { id: "karakalpakstan", name: "Qoraqalpog'iston", type: "respublika" },
  { id: "samarkand", name: "Samarqand viloyati", type: "viloyat" },
  { id: "navoiy", name: "Navoiy viloyati", type: "viloyat" },
  { id: "andijon", name: "Andijon viloyati", type: "viloyat" },

  { id: "qirgiziston-sfm", name: "Fuqarolar Qirg'iziya (SFM)", type: "respublika" },
];

export const Region = new EntitySchema({
  name: "Region",
  tableName: "regions",
  columns: {
    id: { type: "varchar", length: 50, primary: true },
    name: { type: "varchar", length: 100 },
    type: { type: "varchar", length: 20 },
  },
});
