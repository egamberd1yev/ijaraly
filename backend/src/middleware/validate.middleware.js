// Joi sxemasini qabul qilib, so'rovni tekshiruvchi umumiy middleware.
// source: "body" (default) yoki "query" bo'lishi mumkin.
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // barcha xatolarni birdaniga qaytaradi
      stripUnknown: true, // sxemada yo'q maydonlarni olib tashlaydi
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ message: "Ma'lumotlar noto'g'ri", errors });
    }

    req[source] = value;
    next();
  };
}
