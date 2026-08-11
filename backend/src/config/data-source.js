require("reflect-metadata");
const { DataSource } = require("typeorm");
const dotenv = require("dotenv");
const { User } = require("../entities/User");
const { Listing } = require("../entities/Listing");

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "rent_a_home",
  // Rivojlanish jarayonida synchronize: true qulay, lekin production'da
  // migratsiyalardan foydalanish tavsiya etiladi.
  synchronize: true,
  logging: false,
  entities: [User, Listing],
});

module.exports = { AppDataSource };
