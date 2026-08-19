import "reflect-metadata";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source.js";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import contractRoutes from "./routes/contract.routes.js";
import { startExpirationJob } from "./jobs/expireListings.js";

// ES modules'da __dirname mavjud emas, shuning uchun import.meta.url orqali quramiz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Yuklangan rasmlarni statik tarzda ko'rsatish
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", contractRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server ishlayapti" });
});

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Ma'lumotlar bazasiga ulanish muvaffaqiyatli");
    startExpirationJob();
    app.listen(PORT, () => {
      console.log(`🚀 Server http://localhost:${PORT} manzilida ishlamoqda`);
    });
  })
  .catch((err) => {
    console.error("❌ Ma'lumotlar bazasiga ulanishda xatolik:", err);
  });
