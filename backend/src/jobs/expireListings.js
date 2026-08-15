import cron from "node-cron";
import { AppDataSource } from "../config/data-source.js";
import { Listing } from "../entities/Listing.js";

export const LISTING_LIFETIME_DAYS = 7;

// 7 kundan beri "active" holatda turgan, lekin egasi tomonidan "ijaraga
// berildi" deb belgilanmagan e'lonlarni "inactive"ga o'tkazadi.
// Bu bosh sahifada eskirgan (hech kim javob bermagan) e'lonlarning
// abadiy ko'rinib turishining oldini oladi.
export async function expireOldListings() {
  const repo = AppDataSource.getRepository(Listing);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LISTING_LIFETIME_DAYS);

  const result = await repo
    .createQueryBuilder()
    .update(Listing)
    .set({ status: "inactive" })
    .where("status = :status", { status: "active" })
    .andWhere("createdAt < :cutoff", { cutoff })
    .execute();

  const count = result.affected || 0;
  if (count > 0) {
    console.log(`⏱️  ${count} ta eskirgan e'lon "nofaol" holatiga o'tkazildi`);
  }
}

// Har soatda ishga tushadi. Server ishga tushganda ham bir marta
// darhol tekshiradi — shunda server o'chib turgan vaqtda muddati
// o'tib ketgan e'lonlar ham darhol tuzatiladi.
export function startExpirationJob() {
  expireOldListings().catch((err) =>
    console.error("E'lonlar muddatini tekshirishda xatolik:", err)
  );

  cron.schedule("0 * * * *", () => {
    expireOldListings().catch((err) =>
      console.error("E'lonlar muddatini tekshirishda xatolik:", err)
    );
  });
}
