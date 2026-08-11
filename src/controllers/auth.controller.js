const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/data-source");
const { User } = require("../entities/User");

const userRepo = () => AppDataSource.getRepository(User);

function generateToken(userId) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ userId }, secret, { expiresIn });
}

// Parolni javobdan chiqarib tashlash uchun yordamchi funksiya
function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

// req.body Joi orqali allaqachon tekshirilgan (validate middleware)
async function signup(req, res) {
  try {
    const { fullName, email, phone, password } = req.body;

    const repo = userRepo();
    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Bu email bilan foydalanuvchi allaqachon mavjud" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = repo.create({
      fullName,
      email,
      phone: phone || null,
      passwordHash,
      socialLinks: {},
    });

    await repo.save(user);

    const token = generateToken(user.id);
    return res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const repo = userRepo();
    const user = await repo.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }

    const token = generateToken(user.id);
    return res.json({ user: toPublicUser(user), token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

async function getMe(req, res) {
  try {
    const repo = userRepo();
    const user = await repo.findOne({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

// Profilni tahrirlash - ism, telefon, ijtimoiy tarmoq linklari
async function updateProfile(req, res) {
  try {
    const repo = userRepo();
    const user = await repo.findOne({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const { fullName, phone, socialLinks, avatarUrl } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (socialLinks !== undefined) {
      user.socialLinks = { ...user.socialLinks, ...socialLinks };
    }

    await repo.save(user);
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

module.exports = { signup, login, getMe, updateProfile };
