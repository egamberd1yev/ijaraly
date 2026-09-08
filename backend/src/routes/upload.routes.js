import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.middleware.js";
import cloudinary from "../utils/cloudinary.js";

// Fayllarni diskka yozish o'rniga xotirada (RAM) saqlaymiz, keyin
// to'g'ridan-to'g'ri Cloudinary'ga oqim (stream) sifatida yuboramiz —
// Railway'ning diski har deploy'da tozalanib ketishining oldini oladi
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(file.mimetype);
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm fayllari ruxsat etilgan (jpg, png, webp)"));
    }
  },
});

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ijaraly/listings", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

const router = Router();

router.post("/", requireAuth, upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files;
    const urls = await Promise.all(files.map((f) => uploadBufferToCloudinary(f.buffer)));
    res.status(201).json({ urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rasm yuklashda xatolik yuz berdi" });
  }
});

export default router;