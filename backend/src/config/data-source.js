import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User.js";
import { Listing } from "../entities/Listing.js";
import { Contract } from "../entities/Contract.js";

dotenv.config();

export const AppDataSource = new DataSource({
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
  entities: [User, Listing, Contract],
});