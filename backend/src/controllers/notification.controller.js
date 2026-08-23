import { AppDataSource } from "../config/data-source.js";
import { Notification } from "../entities/Notification.js";

export async function getMyNotifications(req, res) {
  try {
    const repo = AppDataSource.getRepository(Notification);
    const notifications = await repo.find({
      where: { userId: req.userId },
      order: { createdAt: "DESC" },
    });
    return res.json({ notifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Bildirishnomalarni yuklab bo'lmadi" });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const repo = AppDataSource.getRepository(Notification);
    const notification = await repo.findOne({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.userId) {
      return res.status(404).json({ message: "Bildirishnoma topilmadi" });
    }
    notification.isRead = true;
    await repo.save(notification);
    return res.json({ notification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Yangilashda xatolik yuz berdi" });
  }
}

// Foydalanuvchi bildirishnomani ro'yxatdan o'chirib/yopib qo'yishi
export async function deleteNotification(req, res) {
  try {
    const repo = AppDataSource.getRepository(Notification);
    const notification = await repo.findOne({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.userId) {
      return res.status(404).json({ message: "Bildirishnoma topilmadi" });
    }
    await repo.remove(notification);
    return res.json({ message: "O'chirildi" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "O'chirishda xatolik yuz berdi" });
  }
}