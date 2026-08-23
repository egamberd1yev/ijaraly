import { Router } from "express";
import {
  getMyNotifications,
  markNotificationRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/notifications/mine", requireAuth, getMyNotifications);
router.patch("/notifications/:id/read", requireAuth, markNotificationRead);
router.delete("/notifications/:id", requireAuth, deleteNotification);

export default router;