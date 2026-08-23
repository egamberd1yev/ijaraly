import { AppDataSource } from "../config/data-source.js";
import { User } from "../entities/User.js";
import { Report } from "../entities/Report.js";
import { Comment } from "../entities/Comment.js";
import { reevaluateUserStatus } from "../utils/moderateUser.js";
import { createNotification } from "../utils/createNotification.js";

// F.I.Sh. bo'yicha foydalanuvchilarni qidirish
export async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const repo = AppDataSource.getRepository(User);

    const users = await repo
      .createQueryBuilder("user")
      .where("user.fullName ILIKE :q", { q: `%${q}%` })
      .select(["user.id", "user.fullName", "user.avatarUrl"])
      .take(20)
      .getMany();

    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Qidirishda xatolik yuz berdi" });
  }
}

// Ommaviy profil — ism, telefon, ijtimoiy tarmoqlar, izohlar
export async function getPublicProfile(req, res) {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const commentRepo = AppDataSource.getRepository(Comment);

    const user = await userRepo.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const comments = await commentRepo.find({
      where: { targetUserId: user.id },
      relations: ["author"],
      order: { createdAt: "DESC" },
    });

    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        socialLinks: user.socialLinks,
        avatarUrl: user.avatarUrl,
      },
      comments: comments.map((c) => ({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        authorName: c.author?.fullName || "Foydalanuvchi",
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Profilni yuklab bo'lmadi" });
  }
}

// Shikoyat qilish — shikoyatchi anonim qoladi, nishon buni bilmaydi
export async function createReport(req, res) {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.userId) {
      return res.status(400).json({ message: "O'zingizga shikoyat qila olmaysiz" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const targetUser = await userRepo.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const reportRepo = AppDataSource.getRepository(Report);

    // Bitta profilga faqat bir marta shikoyat qilish mumkin
    const existing = await reportRepo.findOne({
      where: { reporterId: req.userId, targetUserId },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Siz bu profilga allaqachon shikoyat qilgansiz" });
    }

    const { reason } = req.body;

    const report = reportRepo.create({ reporterId: req.userId, targetUserId, reason });
    await reportRepo.save(report);

    // Shikoyatchining kimligini oshkor qilmagan holda, nishonga xabar beramiz
    await createNotification({
      userId: targetUserId,
      type: "report_received",
      message: "Profilingizga shikoyat tushdi. Qoidalarni buzmaslikka harakat qiling.",
    });

    await reevaluateUserStatus(targetUserId);

    return res.status(201).json({ message: "Shikoyat qabul qilindi" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Shikoyat yuborishda xatolik yuz berdi" });
  }
}

// Ommaviy izoh qoldirish
export async function createComment(req, res) {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.userId) {
      return res.status(400).json({ message: "O'zingizga izoh yoza olmaysiz" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const targetUser = await userRepo.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const commentRepo = AppDataSource.getRepository(Comment);

    const existing = await commentRepo.findOne({
      where: { authorId: req.userId, targetUserId },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Siz bu profilga allaqachon izoh qoldirgansiz" });
    }

    const { text } = req.body;
    const comment = commentRepo.create({ authorId: req.userId, targetUserId, text });
    await commentRepo.save(comment);

    await createNotification({
      userId: targetUserId,
      type: "comment_received",
      message: "Profilingizga yangi izoh yozildi.",
    });

    return res.status(201).json({ message: "Izoh qo'shildi" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Izoh qo'shishda xatolik yuz berdi" });
  }
}