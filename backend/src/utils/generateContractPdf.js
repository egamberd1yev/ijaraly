import PDFDocument from "pdfkit";

function formatMoney(amount, currency) {
  const formatted = Number(amount).toLocaleString("en-US").replace(/,/g, " ");
  return currency === "dollar" ? `$${formatted}` : `${formatted} so'm`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Endi faylga yozish o'rniga PDF'ni xotirada (Buffer) tayyorlab qaytaradi —
// shunda uni to'g'ridan-to'g'ri Cloudinary'ga yuklash mumkin, diskka
// yozib o'tirish shart emas (Railway diski doimiy emasligi sababli)
export function generateContractPdf({ listing, owner, contract }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("KO'CHMAS MULKNI IJARAGA BERISH TO'G'RISIDA SHARTNOMA", { align: "center" });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Tuzilgan sana: ${formatDate(contract.createdAt || new Date())}`, { align: "center" });

    doc.moveDown(1.5);

    section(doc, "1. Shartnoma tomonlari");
    doc
      .font("Helvetica")
      .fontSize(11)
      .text(`Ijaraga beruvchi: ${owner.fullName}${owner.phone ? `, tel: ${owner.phone}` : ""}`);
    doc.text(
      `Ijarachi: ${contract.renterFullName}, pasport: ${contract.renterPassport}${
        contract.renterPhone ? `, tel: ${contract.renterPhone}` : ""
      }`
    );

    doc.moveDown(1);
    section(doc, "2. Shartnoma predmeti");
    doc.font("Helvetica").fontSize(11).text(`Manzil: ${contract.address}`);
    doc.text(`Xonalar soni: ${listing.roomCount}`);
    doc.text(`Holati: ${listing.renovationType === "yevro" ? "Yevro remont" : "Oddiy remont"}`);

    doc.moveDown(1);
    section(doc, "3. Ijara haqi va to'lov tartibi");
    doc
      .font("Helvetica")
      .fontSize(11)
      .text(`Oylik ijara haqi: ${formatMoney(contract.monthlyPrice, contract.currency)}`);
    doc.text(
      "To'lov tomonlar o'rtasida kelishilgan tartibda, har oyning belgilangan sanasida amalga oshiriladi."
    );

    doc.moveDown(1);
    section(doc, "4. Shartnoma muddati");
    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        `Shartnoma ${formatDate(contract.startDate)} sanadan ${formatDate(contract.endDate)} sanagacha amal qiladi.`
      );

    doc.moveDown(1);
    section(doc, "5. Tomonlarning majburiyatlari");
    doc
      .font("Helvetica")
      .fontSize(11)
      .list([
        "Ijaraga beruvchi mulkni ijarachiga bu shartnomada ko'rsatilgan holatda topshiradi.",
        "Ijarachi mulkdan faqat yashash maqsadida foydalanadi va uni asrab-avaylaydi.",
        "Kommunal to'lovlar bo'yicha javobgarlik tomonlar o'rtasida alohida kelishiladi.",
        "Muddatidan oldin bekor qilish tomonlarning o'zaro yozma kelishuvi asosida amalga oshiriladi.",
      ]);

    doc.moveDown(2);
    section(doc, "6. Tomonlarning imzolari");
    doc.moveDown(1);
    const signY = doc.y;
    doc.font("Helvetica").fontSize(11);
    doc.text("Ijaraga beruvchi: _______________________", 56, signY);
    doc.text("Ijarachi: _______________________", 320, signY);

    doc.moveDown(3);
    doc
      .fontSize(8)
      .fillColor("#888888")
      .text(
        "Ushbu hujjat Ijaraly platformasi orqali avtomatik tarzda tuzilgan va faqat yordamchi shablon sifatida taqdim etiladi. " +
          "U professional yuridik maslahatni almashtirmaydi.",
        { align: "center" }
      );

    doc.end();
  });
}

function section(doc, title) {
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#000000").text(title);
  doc.moveDown(0.3);
}