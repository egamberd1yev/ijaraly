const jwt = require("jsonwebtoken");

// Token bor-yo'qligini tekshiradi, bo'lsa req.userId'ni qo'shadi.
// Login qilingan bo'lishi shart bo'lgan route'larda ishlatiladi
// (masalan: yangi e'lon qo'yish, profil tahrirlash).
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Avtorizatsiyadan o'ting" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token yaroqsiz yoki muddati tugagan" });
  }
}

// Token bo'lsa userId'ni qo'shadi, bo'lmasa ham xatolik bermay davom etadi.
// Masalan bosh sahifada login bo'lmagan user ham uylarni ko'ra oladi.
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const secret = process.env.JWT_SECRET || "dev-secret";
      const decoded = jwt.verify(token, secret);
      req.userId = decoded.userId;
    } catch (err) {
      // token yaroqsiz bo'lsa, shunchaki e'tiborsiz qoldiramiz
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
