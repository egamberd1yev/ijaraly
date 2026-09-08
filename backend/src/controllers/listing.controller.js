import { AppDataSource } from "../config/data-source.js";
import { Listing } from "../entities/Listing.js";
import { checkCanPostListing } from "../utils/moderateUser.js";
import { createNotification } from "../utils/createNotification.js";

const listingRepo = () => AppDataSource.getRepository(Listing);

export async function createListing(req, res) {
  try {
    const canPost = await checkCanPostListing(req.userId);
    if (!canPost.allowed) {
      return res.status(403).json({ message: canPost.message });
    }

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
      currency,
      listedBy,
      commissionPercent,
      suitableFor,
      childrenAllowed,
      studentGender,
      maxStudents,
      petsAllowed,
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
      currency: currency || "som",
      listedBy: listedBy || "owner",
      commissionPercent: listedBy === "agent" ? commissionPercent : null,
      suitableFor,
      // Faqat tegishli tanlovga oid maydonlarni saqlaymiz, qolganini
      // "mavjud emas" (null) qilib qo'yamiz — noto'g'ri kombinatsiya
      // bazaga yozilib qolmasligi uchun
      childrenAllowed: suitableFor === "oila" ? childrenAllowed : null,
      studentGender: suitableFor === "talaba" ? studentGender : null,
      maxStudents: suitableFor === "talaba" ? maxStudents : null,
      petsAllowed: petsAllowed === undefined ? null : petsAllowed,
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

export async function getListings(req, res) {
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
      minRoomCount,
      suitableFor,
      childrenAllowed,
      studentGender,
      petsAllowed,
      page,
      limit,
    } = req.query;

    const repo = listingRepo();
    const qb = repo
      .createQueryBuilder("listing")
      .leftJoinAndSelect("listing.owner", "owner")
      .where("listing.status = :status", { status: "active" });

    if (address) qb.andWhere("listing.address ILIKE :address", { address: `%${address}%` });
    if (renovationType) qb.andWhere("listing.renovationType = :renovationType", { renovationType });
    if (hasGas === "true") qb.andWhere("listing.hasGas = true");
    if (hasWater === "true") qb.andWhere("listing.hasWater = true");
    if (hasElectricity === "true") qb.andWhere("listing.hasElectricity = true");
    if (hasFurniture === "true") qb.andWhere("listing.hasFurniture = true");

    // "5+" kabi minimal chegara — aniq songa ustunlik beradi
    if (minRoomCount) {
      qb.andWhere("listing.roomCount >= :minRoomCount", { minRoomCount });
    } else if (roomCount) {
      qb.andWhere("listing.roomCount = :roomCount", { roomCount });
    }

    if (minPrice !== undefined) qb.andWhere("listing.price >= :minPrice", { minPrice });
    if (maxPrice !== undefined) qb.andWhere("listing.price <= :maxPrice", { maxPrice });

    if (suitableFor) qb.andWhere("listing.suitableFor = :suitableFor", { suitableFor });
    if (childrenAllowed === "true") qb.andWhere("listing.childrenAllowed = true");
    if (studentGender) qb.andWhere("listing.studentGender = :studentGender", { studentGender });
    if (petsAllowed === "true") qb.andWhere("listing.petsAllowed = true");

    qb.orderBy("listing.createdAt", "DESC");
    qb.skip((page - 1) * limit).take(limit);

    const [listings, total] = await qb.getManyAndCount();
    return res.json({ listings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

export async function getListingById(req, res) {
  try {
    const repo = listingRepo();
    const listing = await repo.findOne({ where: { id: req.params.id }, relations: ["owner"] });
    if (!listing) return res.status(404).json({ message: "E'lon topilmadi" });
    return res.json({ listing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

export async function getMyListings(req, res) {
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

export async function updateListing(req, res) {
  try {
    const repo = listingRepo();
    const listing = await repo.findOne({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ message: "E'lon topilmadi" });
    if (listing.ownerId !== req.userId) {
      return res.status(403).json({ message: "Bu e'lonni tahrirlash huquqingiz yo'q" });
    }

    Object.assign(listing, req.body);
    await repo.save(listing);

    if (req.body.status === "rented") {
      await createNotification({
        userId: listing.ownerId,
        type: "listing_rented",
        message: `"${listing.address}" e'loni ijaraga berildi deb belgilandi.`,
        relatedListingId: listing.id,
      });
    }

    return res.json({ listing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
}

export async function deleteListing(req, res) {
  try {
    const repo = listingRepo();
    const listing = await repo.findOne({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ message: "E'lon topilmadi" });
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