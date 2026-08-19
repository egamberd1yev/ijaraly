import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { AppDataSource } from "../config/data-source.js";
import { Listing } from "../entities/Listing.js";
import { Contract } from "../entities/Contract.js";
import { User } from "../entities/User.js";
import { generateContractPdf } from "../utils/generateContractPdf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractsDir = path.join(__dirname, "..", "..", "uploads", "contracts");
if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
}

// E'lon egasi shartnoma tuzadi — ijarachi ma'lumotlari qo'lda kiritiladi
// (req.body Joi orqali allaqachon tekshirilgan)
export async function createContract(req, res) {
  try {
    const listingRepo = AppDataSource.getRepository(Listing);
    const contractRepo = AppDataSource.getRepository(Contract);
    const userRepo = AppDataSource.getRepository(User);

    const listing = await listingRepo.findOne({ where: { id: req.params.id } });
    if (!listing) {
      return res.status(404).json({ message: "E'lon topilmadi" });
    }
    if (listing.ownerId !== req.userId) {
      return res
        .status(403)
        .json({ message: "Faqat e'lon egasi shartnoma tuza oladi" });
    }

    const owner = await userRepo.findOne({ where: { id: req.userId } });

    const { renterFullName, renterPassport, renterPhone, startDate, endDate } =
      req.body;

    // Avval yozuvni saqlaymiz (createdAt va id shu yerda hosil bo'ladi),
    // keyin shu ma'lumotlar asosida PDF yaratamiz
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
      pdfFilename: "", // pastda to'ldiriladi
    });
    await contractRepo.save(contract);

    const pdfFilename = `contract-${contract.id}.pdf`;
    const filePath = path.join(contractsDir, pdfFilename);

    await generateContractPdf({ filePath, listing, owner, contract });

    contract.pdfFilename = pdfFilename;
    await contractRepo.save(contract);

    return res.status(201).json({
      contract: { ...contract, pdfUrl: `/uploads/contracts/${pdfFilename}` },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Shartnoma yaratishda xatolik yuz berdi" });
  }
}

// E'lon egasining barcha shartnomalari — "Mening shartnomalarim" sahifasi uchun
export async function getMyContracts(req, res) {
  try {
    const contractRepo = AppDataSource.getRepository(Contract);
    const contracts = await contractRepo.find({
      where: { ownerId: req.userId },
      order: { createdAt: "DESC" },
    });

    const withUrls = contracts.map((c) => ({
      ...c,
      pdfUrl: `/uploads/contracts/${c.pdfFilename}`,
    }));

    return res.json({ contracts: withUrls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Shartnomalarni yuklab bo'lmadi" });
  }
}