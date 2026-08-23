import { AppDataSource } from "../config/data-source.js";
import { User } from "../entities/User.js";
import { Report } from "../entities/Report.js";

const SUSPEND_THRESHOLD = 3; // shundan ortiq bo'lsa — vaqtincha ban
const BLOCK_THRESHOLD = 15; // shundan ortiq bo'lsa — butunlay blok
const SUSPENSION_DAYS = 14;
const WINDOW_DAYS = 30; // har bir shikoyat shu muddat davomida "amalda" hisoblanadi

// Yangi shikoyat kelganidan keyin chaqiriladi. Nishon (target) foydalanuvchining
// oxirgi 30 kundagi shikoyatlari sonini hisoblab, kerak bo'lsa holatini yangilaydi.
export async function reevaluateUserStatus(targetUserId) {
  const reportRepo = AppDataSource.getRepository(Report);
  const userRepo = AppDataSource.getRepository(User);

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - WINDOW_DAYS);

  const recentCount = await reportRepo
    .createQueryBuilder("report")
    .where("report.targetUserId = :targetUserId", { targetUserId })
    .andWhere("report.createdAt >= :windowStart", { windowStart })
    .getCount();

  const user = await userRepo.findOne({ where: { id: targetUserId } });
  if (!user) return;

  if (recentCount > BLOCK_THRESHOLD) {
    user.accountStatus = "blocked";
    user.suspendedUntil = null;
    await userRepo.save(user);
  } else if (recentCount > SUSPEND_THRESHOLD) {
    // Allaqachon blok bo'lganini vaqtincha banga pasaytirmaymiz
    if (user.accountStatus !== "blocked") {
      const suspendedUntil = new Date();
      suspendedUntil.setDate(suspendedUntil.getDate() + SUSPENSION_DAYS);
      user.accountStatus = "suspended";
      user.suspendedUntil = suspendedUntil;
      await userRepo.save(user);
    }
  }
}

// Foydalanuvchi hozir e'lon qo'ya oladimi yo'qmi tekshiradi.
// Muddati o'tgan "suspended" holatini avtomatik "active"ga qaytaradi.
export async function checkCanPostListing(userId) {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) return { allowed: false, message: "Foydalanuvchi topilmadi" };

  if (user.accountStatus === "blocked") {
    return { allowed: false, message: "Akkauntingiz bloklangan" };
  }

  if (user.accountStatus === "suspended") {
    if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      const untilStr = new Date(user.suspendedUntil).toLocaleDateString("uz-UZ");
      return {
        allowed: false,
        message: `Ko'p shikoyat sababli vaqtincha e'lon joylay olmaysiz (${untilStr} gacha)`,
      };
    }
    // Muddat o'tgan — holatni tiklaymiz
    user.accountStatus = "active";
    user.suspendedUntil = null;
    await userRepo.save(user);
  }

  return { allowed: true };
}
