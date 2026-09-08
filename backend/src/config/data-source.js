// import "reflect-metadata";
// import { DataSource } from "typeorm";
// import dotenv from "dotenv";
// import { User } from "../entities/User.js";
// import { Listing } from "../entities/Listing.js";
// import { Contract } from "../entities/Contract.js";
// import { Report } from "../entities/Report.js";
// import { Comment } from "../entities/Comment.js";
// import { Notification } from "../entities/Notification.js";

// dotenv.config();

// const entities = [User, Listing, Contract, Report, Comment, Notification];

// // Railway (va ko'pchilik hosting xizmatlari) bitta DATABASE_URL beradi,
// // lokal kompyuterda esa odatda alohida DB_HOST/DB_USER va h.k. ishlatiladi.
// // Ikkalasini ham qo'llab-quvvatlaymiz.
// const isProduction = process.env.NODE_ENV === "production";

// export const AppDataSource = process.env.DATABASE_URL
//   ? new DataSource({
//       type: "postgres",
//       url: process.env.DATABASE_URL,
//       synchronize: true,
//       logging: false,
//       entities,
//       // Railway'ning Postgres'i SSL talab qiladi, lekin sertifikatni
//       // tekshirmaymiz (Railway ichki tarmog'ida bu keng tarqalgan amaliyot)
//       ssl: isProduction ? { rejectUnauthorized: false } : false,
//     })
//   : new DataSource({
//       type: "postgres",
//       host: process.env.DB_HOST || "localhost",
//       port: Number(process.env.DB_PORT) || 5432,
//       username: process.env.DB_USERNAME || "postgres",
//       password: process.env.DB_PASSWORD || "postgres",
//       database: process.env.DB_NAME || "ijaraly",
//       synchronize: true,
//       logging: false,
//       entities,
//     });

import dotenv from "dotenv";
dotenv.config(); // Eng birinchi o'rinda tursin!

import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User.js";
import { Listing } from "../entities/Listing.js"; 
import { Contract } from "../entities/Contract.js";
import { Report } from "../entities/Report.js";
import { Comment } from "../entities/Comment.js";
import { Notification } from "../entities/Notification.js";

const entities = [User, Listing, Contract, Report, Comment, Notification];
const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = process.env.DATABASE_URL
  ? new DataSource({
      type: "postgres",
      url: process.env.DATABASE_URL,
      synchronize: true, // Eslatma: Production'da buni false qilib, migratsiya ishlatish tavsiya etiladi
      logging: false,
      entities,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    })
  : new DataSource({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "ijaraly",
      synchronize: true,
      logging: false,
      entities,
    });