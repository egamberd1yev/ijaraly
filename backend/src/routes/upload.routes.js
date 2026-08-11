const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireAuth } = require("../middleware/auth.middleware");

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

module.exports = router;
