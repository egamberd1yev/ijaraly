const { AppDataSource } = require("../config/data-source");
const { Listing } = require("../entities/Listing");

const listingRepo = () => AppDataSource.getRepository(Listing);

// Yangi e'lon qo'yish (login bo'lgan foydalanuvchi uchun)
// req.body Joi orqali allaqachon tekshirilgan (validate middleware)
async function createListing(req, res) {
  try {
    const {
      images,
      address,
      renovationType,
      hasGas,
      hasWater,
      hasElectricity,
      hasFurniture,
      roomCount,
      price,
      description,
    } = req.body;

    const repo = listingRepo();
    const listing = repo.create({
      ownerId: req.userId,
      images: images || [],
      address,
      renovationType: renovationType || "oddiy",
      hasGas: !!hasGas,
      hasWater: !!hasWater,
      hasElectricity: !!hasElectricity,
      hasFurniture: !!hasFurniture,
      roomCount,
      price,
      description: description || null,
      status: "active",
    });

    await repo.save(listing);
    return res.status(201).json({ listing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

// Bosh sahifa / qidiruv / filter uchun umumiy ro'yxat olish
// req.query Joi orqali allaqachon tekshirilgan va default qiymatlar bilan to'ldirilgan
async function getListings(req, res) {
  try {
    const {
      address,
      renovationType,
      hasGas,
      hasWater,
      hasElectricity,
      hasFurniture,
      minPrice,
      maxPrice,
      roomCount,
      page,
      limit,
    } = req.query;

    const repo = listingRepo();
    const qb = repo
      .createQueryBuilder("listing")
      .leftJoinAndSelect("listing.owner", "owner")
      .where("listing.status = :status", { status: "active" });

    // Manzil bo'yicha qidiruv - masalan "3 kichik daha"
    if (address) {
      qb.andWhere("listing.address ILIKE :address", { address: `%${address}%` });
    }

    if (renovationType) {
      qb.andWhere("listing.renovationType = :renovationType", { renovationType });
    }

    if (hasGas === "true") qb.andWhere("listing.hasGas = true");
    if (hasWater === "true") qb.andWhere("listing.hasWater = true");
    if (hasElectricity === "true") qb.andWhere("listing.hasElectricity = true");
    if (hasFurniture === "true") qb.andWhere("listing.hasFurniture = true");
    // Eslatma: frontend'dagi "Barcha sharoit bor" filteri hasGas=true,
    // hasWater=true, hasElectricity=true'ni birgalikda yuboradi —
    // bu yerda alohida maxsus holat kerak emas.

    if (roomCount) {
      qb.andWhere("listing.roomCount = :roomCount", { roomCount });
    }

    if (minPrice !== undefined) {
      qb.andWhere("listing.price >= :minPrice", { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere("listing.price <= :maxPrice", { maxPrice });
    }

    qb.orderBy("listing.createdAt", "DESC");
    qb.skip((page - 1) * limit).take(limit);

    const [listings, total] = await qb.getManyAndCount();

    return res.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

async function getListingById(req, res) {
  try {
    const repo = listingRepo();
    const listing = await repo.findOne({
      where: { id: req.params.id },
      relations: ["owner"],
    });

    if (!listing) {
      return res.status(404).json({ message: "E'lon topilmadi" });
    }

    return res.json({ listing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

// Faqat o'zining e'lonlari (profil / dashboard uchun)
async function getMyListings(req, res) {
  try {
    const repo = listingRepo();
    const listings = await repo.find({
      where: { ownerId: req.userId },
      order: { createdAt: "DESC" },
    });
    return res.json({ listings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

async function updateListing(req, res) {
  try {
    const repo = listingRepo();
    const listing = await repo.findOne({ where: { id: req.params.id } });

    if (!listing) {
      return res.status(404).json({ message: "E'lon topilmadi" });
    }
    if (listing.ownerId !== req.userId) {
      return res.status(403).json({ message: "Bu e'lonni tahrirlash huquqingiz yo'q" });
    }

    Object.assign(listing, req.body);
    await repo.save(listing);
    return res.json({ listing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

async function deleteListing(req, res) {
  try {
    const repo = listingRepo();
    const listing = await repo.findOne({ where: { id: req.params.id } });

    if (!listing) {
      return res.status(404).json({ message: "E'lon topilmadi" });
    }
    if (listing.ownerId !== req.userId) {
      return res.status(403).json({ message: "Bu e'lonni o'chirish huquqingiz yo'q" });
    }

    await repo.remove(listing);
    return res.json({ message: "E'lon o'chirildi" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

module.exports = {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
};