import Joi from "joi";
import { RENOVATION_TYPES } from "../entities/Listing.js";

// ---- Auth ----

export const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Ism kiritilishi shart",
    "string.min": "Ism kamida 2 ta belgidan iborat bo'lishi kerak",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email manzili noto'g'ri formatda",
    "string.empty": "Email kiritilishi shart",
  }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .allow(null, "")
    .messages({
      "string.pattern.base": "Telefon raqami noto'g'ri formatda",
    }),
  password: Joi.string().min(6).max(72).required().messages({
    "string.min": "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
    "string.empty": "Parol kiritilishi shart",
  }),
  agreeToTerms: Joi.boolean().valid(true).required().messages({
    "any.only": "Davom etish uchun shartlar va qoidalarga rozilik bildirishingiz kerak",
    "any.required": "Davom etish uchun shartlar va qoidalarga rozilik bildirishingiz kerak",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email manzili noto'g'ri formatda",
    "string.empty": "Email kiritilishi shart",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Parol kiritilishi shart",
  }),
});

// Har bir ijtimoiy tarmoq uchun: foydalanuvchi nomi (nik) va to'liq link
const socialPlatformSchema = Joi.object({
  username: Joi.string().allow(null, "").max(100),
  url: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Link to'g'ri formatda bo'lishi kerak (https:// bilan boshlansin)",
  }),
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .allow(null, ""),
  avatarUrl: Joi.string().uri().allow(null, ""),
  socialLinks: Joi.object({
    instagram: socialPlatformSchema,
    telegram: socialPlatformSchema,
    facebook: socialPlatformSchema,
  }),
});

// ---- Listings ----

export const createListingSchema = Joi.object({
  images: Joi.array().items(Joi.string()).default([]),
  address: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Manzil kiritilishi shart",
    "string.min": "Manzil juda qisqa",
  }),
  renovationType: Joi.string()
    .valid(...RENOVATION_TYPES)
    .default("oddiy")
    .messages({
      "any.only": `Remont turi quyidagilardan biri bo'lishi kerak: ${RENOVATION_TYPES.join(", ")}`,
    }),
  hasGas: Joi.boolean().default(false),
  hasWater: Joi.boolean().default(false),
  hasElectricity: Joi.boolean().default(false),
  hasFurniture: Joi.boolean().default(false),
  roomCount: Joi.number().integer().min(1).max(50).required().messages({
    "number.base": "Honalar soni raqam bo'lishi kerak",
    "any.required": "Honalar soni kiritilishi shart",
  }),
  price: Joi.number().integer().min(0).required().messages({
    "number.base": "Narx raqam bo'lishi kerak",
    "any.required": "Narx kiritilishi shart",
  }),
  currency: Joi.string().valid("som", "dollar").default("som").messages({
    "any.only": "Valyuta 'som' yoki 'dollar' bo'lishi kerak",
  }),
  listedBy: Joi.string().valid("owner", "agent").default("owner").messages({
    "any.only": "'owner' yoki 'agent' bo'lishi kerak",
  }),
  // Faqat vositachi (agent) tanlanganda komissiya foizi majburiy —
  // mulk egasi uchun bu maydon kerak emas
  commissionPercent: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .when("listedBy", {
      is: "agent",
      then: Joi.required().messages({
        "any.required": "Vositachi uchun komissiya foizi kiritilishi shart",
      }),
      otherwise: Joi.optional().allow(null),
    }),
  description: Joi.string().max(2000).allow(null, ""),
});

export const updateListingSchema = Joi.object({
  images: Joi.array().items(Joi.string()),
  address: Joi.string().min(3).max(255),
  renovationType: Joi.string().valid(...RENOVATION_TYPES),
  hasGas: Joi.boolean(),
  hasWater: Joi.boolean(),
  hasElectricity: Joi.boolean(),
  hasFurniture: Joi.boolean(),
  roomCount: Joi.number().integer().min(1).max(50),
  price: Joi.number().integer().min(0),
  currency: Joi.string().valid("som", "dollar"),
  listedBy: Joi.string().valid("owner", "agent"),
  commissionPercent: Joi.number().integer().min(0).max(100).allow(null),
  description: Joi.string().max(2000).allow(null, ""),
  status: Joi.string().valid("active", "rented", "inactive"),
});

export const listingQuerySchema = Joi.object({
  address: Joi.string().allow(""),
  renovationType: Joi.string().valid(...RENOVATION_TYPES),
  hasGas: Joi.string().valid("true", "false"),
  hasWater: Joi.string().valid("true", "false"),
  hasElectricity: Joi.string().valid("true", "false"),
  hasFurniture: Joi.string().valid("true", "false"),
  roomCount: Joi.number().integer().min(1),
  minPrice: Joi.number().integer().min(0),
  maxPrice: Joi.number().integer().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});