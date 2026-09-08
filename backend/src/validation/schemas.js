import Joi from "joi";
import { RENOVATION_TYPES, SUITABLE_FOR_OPTIONS, STUDENT_GENDER_OPTIONS } from "../entities/Listing.js";

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
    .messages({ "string.pattern.base": "Telefon raqami noto'g'ri formatda" }),
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
  password: Joi.string().required().messages({ "string.empty": "Parol kiritilishi shart" }),
});

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
  // .empty(null) bilan birga — agent bo'lmasa "" yoki null ham xavfsiz o'tadi
  commissionPercent: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .empty(["", null])
    .when("listedBy", {
      is: "agent",
      then: Joi.required().messages({
        "any.required": "Vositachi uchun komissiya foizi kiritilishi shart",
      }),
      otherwise: Joi.optional(),
    }),

  suitableFor: Joi.string()
    .valid(...SUITABLE_FOR_OPTIONS)
    .required()
    .messages({
      "any.required": "Uy kimlar uchun ekanini tanlashingiz shart",
      "any.only": "Noto'g'ri tanlov",
    }),
  // DIQQAT: .empty("") — frontend bo'sh satr ("") yuborsa ham, Joi buni
  // "berilmagan" deb hisoblaydi va "otherwise" shoxobchasiga o'tadi.
  // Shu qatorning yo'qligi oldingi xatoning asosiy sababi edi.
  childrenAllowed: Joi.boolean()
    .empty("")
    .when("suitableFor", {
      is: "oila",
      then: Joi.required().messages({
        "any.required": "Yosh bolali oilalarga ruxsat borligini belgilang",
      }),
      otherwise: Joi.optional().allow(null),
    }),
  studentGender: Joi.string()
    .valid(...STUDENT_GENDER_OPTIONS)
    .empty("")
    .when("suitableFor", {
      is: "talaba",
      then: Joi.required().messages({ "any.required": "Talabaning jinsini tanlang" }),
      otherwise: Joi.optional().allow(null),
    }),
  maxStudents: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .empty(["", null])
    .when("suitableFor", {
      is: "talaba",
      then: Joi.required().messages({
        "any.required": "Nechta talabagacha mumkinligini kiriting",
      }),
      otherwise: Joi.optional(),
    }),
  petsAllowed: Joi.boolean().empty("").allow(null).optional(),

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
  commissionPercent: Joi.number().integer().min(0).max(100).empty(["", null]).optional(),
  suitableFor: Joi.string().valid(...SUITABLE_FOR_OPTIONS),
  childrenAllowed: Joi.boolean().empty("").allow(null),
  studentGender: Joi.string()
    .valid(...STUDENT_GENDER_OPTIONS)
    .empty("")
    .allow(null),
  maxStudents: Joi.number().integer().min(1).max(20).empty(["", null]).optional(),
  petsAllowed: Joi.boolean().empty("").allow(null),
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
  minRoomCount: Joi.number().integer().min(1),
  minPrice: Joi.number().integer().min(0),
  maxPrice: Joi.number().integer().min(0),
  suitableFor: Joi.string().valid(...SUITABLE_FOR_OPTIONS),
  childrenAllowed: Joi.string().valid("true", "false"),
  studentGender: Joi.string().valid(...STUDENT_GENDER_OPTIONS),
  petsAllowed: Joi.string().valid("true", "false"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});

// ---- Shartnoma ----

export const createContractSchema = Joi.object({
  renterFullName: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Ijarachining to'liq ismi kiritilishi shart",
  }),
  renterPassport: Joi.string().min(4).max(50).required().messages({
    "string.empty": "Pasport seriya-raqami kiritilishi shart",
  }),
  renterPhone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .allow(null, "")
    .messages({ "string.pattern.base": "Telefon raqami noto'g'ri formatda" }),
  startDate: Joi.date().required().messages({
    "any.required": "Boshlanish sanasi kiritilishi shart",
    "date.base": "Boshlanish sanasi noto'g'ri",
  }),
  endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
    "any.required": "Tugash sanasi kiritilishi shart",
    "date.greater": "Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak",
  }),
});

// ---- Foydalanuvchi qidiruvi, shikoyat, izoh ----

export const userSearchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Qidiruv so'zi kiritilishi shart",
    "string.min": "Kamida 2 ta belgi kiriting",
  }),
});

export const createReportSchema = Joi.object({
  reason: Joi.string().min(10).max(1000).required().messages({
    "string.empty": "Shikoyat sababi kiritilishi shart",
    "string.min": "Sababni batafsilroq yozing (kamida 10 ta belgi)",
  }),
  affirmedTruth: Joi.boolean().valid(true).required().messages({
    "any.only": "Yozganlaringiz haqiqat ekanligini tasdiqlashingiz kerak",
    "any.required": "Yozganlaringiz haqiqat ekanligini tasdiqlashingiz kerak",
  }),
});

export const createCommentSchema = Joi.object({
  text: Joi.string().min(3).max(1000).required().messages({
    "string.empty": "Izoh matni kiritilishi shart",
    "string.min": "Izoh juda qisqa",
  }),
});