import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.middleware.js";

// ES modules'da __dirname mavjud emas, shuning uchun import.meta.url orqali quramiz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm fayllari ruxsat etilgan (jpg, png, webp)"));
    }
  },
});

const router = Router();

// Bir nechta rasm yuklash (masalan e'lon uchun uy rasmlari)
router.post("/", requireAuth, upload.array("images", 10), (req, res) => {
  const files = req.files;
  const urls = files.map((f) => `/uploads/${f.filename}`);
  res.status(201).json({ urls });
});

export default router;
