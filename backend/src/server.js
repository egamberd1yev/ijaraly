import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source.js";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import contractRoutes from "./routes/contract.routes.js";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { startExpirationJob } from "./jobs/expireListings.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// FRONTEND_URL productionda Vercel domenini ko'rsatadi (masalan
// https://ijaraly.vercel.app). Agar sozlanmagan bo'lsa (masalan lokal
// ishlab chiqishda), hamma manzillarga ruxsat beramiz.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DIQQAT: "/uploads" statik papkasi olib tashlandi — rasmlar va PDF'lar
// endi Cloudinary'da saqlanadi, backend ularni o'zi ko'rsatmaydi

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", contractRoutes);
app.use("/api", userRoutes);
app.use("/api", notificationRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server ishlayapti" });
});

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Ma'lumotlar bazasiga ulanish muvaffaqiyatli");
    startExpirationJob();
    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT}-portda ishlamoqda`);
    });
  })
  .catch((err) => {
    console.error("❌ Ma'lumotlar bazasiga ulanishda xatolik:", err);
  });