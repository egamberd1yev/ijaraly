import { AppDataSource } from "../config/data-source.js";
import { Listing } from "../entities/Listing.js";
import { Contract } from "../entities/Contract.js";
import { User } from "../entities/User.js";
import { generateContractPdf } from "../utils/generateContractPdf.js";
import { createNotification } from "../utils/createNotification.js";
import cloudinary from "../utils/cloudinary.js";

// PDF buffer'ni Cloudinary'ga "raw" fayl sifatida yuklaydi (rasm emas,
// hujjat sifatida) va uning to'liq havolasini qaytaradi
function uploadPdfToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ijaraly/contracts",
        public_id: publicId,
        resource_type: "raw",
        format: "pdf",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function createContract(req, res) {
  try {
    const listingRepo = AppDataSource.getRepository(Listing);
    const contractRepo = AppDataSource.getRepository(Contract);
    const userRepo = AppDataSource.getRepository(User);

    const listing = await listingRepo.findOne({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ message: "E'lon topilmadi" });
    if (listing.ownerId !== req.userId) {
      return res.status(403).json({ message: "Faqat e'lon egasi shartnoma tuza oladi" });
    }

    const owner = await userRepo.findOne({ where: { id: req.userId } });
    const { renterFullName, renterPassport, renterPhone, startDate, endDate } = req.body;

    // Avval yozuvni saqlaymiz — shu orqali contract.id va createdAt hosil bo'ladi,
    // ular PDF matnida va Cloudinary fayl nomida ishlatiladi
    const contract = contractRepo.create({
      listingId: listing.id,
      ownerId: req.userId,
      address: listing.address,
      monthlyPrice: listing.price,
      currency: listing.currency,
      renterFullName,
      renterPassport,
      renterPhone: renterPhone || null,
      startDate,
      endDate,
      pdfUrl: "", // pastda to'ldiriladi
    });
    await contractRepo.save(contract);

    const pdfBuffer = await generateContractPdf({ listing, owner, contract });
    const pdfUrl = await uploadPdfToCloudinary(pdfBuffer, `contract-${contract.id}`);

    contract.pdfUrl = pdfUrl;
    await contractRepo.save(contract);

    await createNotification({
      userId: req.userId,
      type: "contract_created",
      message: `"${listing.address}" uchun ${contract.renterFullName} bilan shartnoma tuzildi.`,
      relatedListingId: listing.id,
    });

    return res.status(201).json({ contract });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Shartnoma yaratishda xatolik yuz berdi" });
  }
}

export async function getMyContracts(req, res) {
  try {
    const contractRepo = AppDataSource.getRepository(Contract);
    const contracts = await contractRepo.find({
      where: { ownerId: req.userId },
      order: { createdAt: "DESC" },
    });
    return res.json({ contracts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Shartnomalarni yuklab bo'lmadi" });
  }
}