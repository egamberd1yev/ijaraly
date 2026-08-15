require("reflect-metadata");
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { AppDataSource } = require("./config/data-source");
const authRoutes = require("./routes/auth.routes");
const listingRoutes = require("./routes/listing.routes");
const uploadRoutes = require("./routes/upload.routes");
const { startExpirationJob } = require("./jobs/expireListings");

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