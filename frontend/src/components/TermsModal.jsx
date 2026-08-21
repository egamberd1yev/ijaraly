// Foydalanish shartlari va qoidalari modali.
// Matn SECTIONS massivida saqlanadi — shunda kelajakda matnni
// yangilash uchun faqat shu massivni tahrirlash kifoya, JSX
// tuzilishiga tegish shart emas.
const INTRO =
  'Ushbu Foydalanish shartlari ("Shartlar") Ijaraly platformasidan ' +
  '("Platforma", "biz") foydalanuvchi shaxs ("Foydalanuvchi", "siz") ' +
  "o'rtasidagi munosabatlarni tartibga soladi. Platformadan ro'yxatdan " +
  "o'tish orqali siz ushbu Shartlarga to'liq rozilik bildirasiz.";

const SECTIONS = [
  {
    title: "1. Umumiy qoidalar",
    items: [
      "1.1. Ijaraly — uzoq muddatli ko'chmas mulk ijarasi bo'yicha e'lonlarni joylashtirish, qidirish va ular o'rtasida aloqa o'rnatish imkonini beruvchi onlayn platforma.",
      "1.2. Platforma ijaraga oid bitimlarning tomoni hisoblanmaydi. Ijaraly faqat texnik vositachi (axborot maydoni) sifatida ishlaydi; mulk egasi (yoki uning vositachisi) va ijarachi o'rtasidagi barcha kelishuvlar, shartnomalar va to'lovlar tomonlarning o'zaro javobgarligi hisoblanadi.",
      "1.3. Platformadan foydalanish orqali siz 18 yoshga to'lganingizni va mazkur Shartlarni tushunib, ularga rozilik bildirganingizni tasdiqlaysiz.",
    ],
  },
  {
    title: "2. Ro'yxatdan o'tish va akkaunt",
    items: [
      "2.1. Platformadan to'liq foydalanish uchun ro'yxatdan o'tish talab qilinadi. Ro'yxatdan o'tishda kiritilgan ma'lumotlar haqiqiy va dolzarb bo'lishi shart.",
      "2.2. Foydalanuvchi bitta akkaunt orqali ham mulk egasi (ijaraga beruvchi), ham ijarachi (qidiruvchi) sifatida faoliyat yuritishi mumkin.",
      "2.3. Akkaunt maxfiyligini ta'minlash — Foydalanuvchining shaxsiy javobgarligi. Akkaunt orqali amalga oshirilgan barcha harakatlar Foydalanuvchi tomonidan amalga oshirilgan deb hisoblanadi.",
      "2.4. Platforma Foydalanuvchining aloqa raqamini (telefon) tasdiqlash huquqini o'zida saqlab qoladi.",
    ],
  },
  {
    title: "3. E'lon joylashtirish qoidalari",
    items: [
      "3.1. Foydalanuvchi joylashtirilayotgan e'londa ko'rsatilgan ma'lumotlar (manzil, holat, narx, rasmlar) haqiqatga mos kelishini kafolatlaydi.",
      "3.2. Agar e'lon vositachi (rieltor) tomonidan joylashtirilayotgan bo'lsa, Foydalanuvchi buni aniq belgilashi va komissiya foizini oshkor qilishi shart. Komissiya haqidagi ma'lumotni yashirish yoki noto'g'ri ko'rsatish ushbu Shartlarning jiddiy buzilishi hisoblanadi.",
      "3.3. Bir xil mulk uchun bir vaqtning o'zida bir nechta faol e'lon joylashtirish, agar mulk haqiqatda band bo'lsa, taqiqlanadi.",
      "3.4. Mulk ijaraga berilgach, Foydalanuvchi tegishli e'lonni \"ijaraga berildi\" deb belgilashi so'raladi. Platforma faollik ko'rsatilmagan e'lonlarni belgilangan muddatdan (hozirda 7 kun) so'ng avtomatik nofaol holatga o'tkazadi.",
    ],
  },
  {
    title: "4. Shartnoma generatori",
    items: [
      "4.1. Platformada mavjud avtomatik shartnoma generatori orqali tuzilgan hujjat — yordamchi shablon bo'lib, tomonlarning o'zaro kelishuviga asosan to'ldiriladi.",
      "4.2. Ushbu hujjat professional yuridik xizmat yoki notarial tasdiqlangan shartnoma o'rnini bosmaydi. Muhim yoki yuqori qiymatli bitimlar uchun tomonlarga mustaqil yuridik maslahat olish tavsiya etiladi.",
      "4.3. Platforma generator orqali tuzilgan hujjatning yuridik kuchi yoki tomonlar o'rtasidagi bitimning bajarilishi uchun javobgarlikni o'z zimmasiga olmaydi.",
    ],
  },
  {
    title: "5. To'lovlar",
    items: [
      "5.1. Platforma foydalanuvchilar o'rtasidagi ijara haqi yoki komissiya to'lovlarini o'zi qabul qilmaydi va ularga vositachilik qilmaydi. Barcha moliyaviy operatsiyalar tomonlarning o'zaro kelishuvi asosida, platformadan tashqarida amalga oshiriladi.",
      "5.2. Platforma to'lovlar bilan bog'liq nizolarga aralashmaydi, biroq Foydalanuvchi shikoyat mexanizmi orqali muammo haqida xabar berishi mumkin.",
    ],
  },
  {
    title: "6. Taqiqlangan xatti-harakatlar",
    intro: "Quyidagilar qat'iyan taqiqlanadi:",
    list: [
      "Soxta yoki chalg'ituvchi e'lon joylashtirish",
      "Boshqa Foydalanuvchini firibgarlik yo'li bilan pul yoki shaxsiy ma'lumot olishga undash",
      "Kamsituvchi, haqoratli, zo'ravonlikka chaqiruvchi kontent tarqatish",
      "Platformadan spam, reklama yoki Shartlarda ko'rsatilmagan boshqa maqsadlarda foydalanish",
      "Boshqa Foydalanuvchining shaxsiy ma'lumotlarini ruxsatsiz yig'ish yoki tarqatish",
    ],
  },
  {
    title: "7. Shikoyat va moderatsiya",
    items: [
      "7.1. Foydalanuvchi shubhali yoki qoidabuzar e'lon/profil haqida Platformaga shikoyat qilish huquqiga ega.",
      "7.2. Platforma shikoyatlarni ko'rib chiqib, tegishli e'lon yoki akkauntni vaqtincha yoki doimiy bloklash huquqini o'zida saqlab qoladi.",
    ],
  },
  {
    title: "8. Javobgarlikni cheklash",
    items: [
      "8.1. Platforma Foydalanuvchilar tomonidan joylashtirilgan ma'lumotlarning to'g'riligi, mulkning haqiqiy holati yoki tomonlar o'rtasidagi bitimning bajarilishi uchun javobgar emas.",
      "8.2. Platformadan foydalanish natijasida yuzaga kelishi mumkin bo'lgan bilvosita zararlar uchun Platforma javobgarlikni imkon qadar qonun chegarasida cheklaydi.",
    ],
  },
  {
    title: "9. Maxfiylik",
    items: [
      "Shaxsiy ma'lumotlaringiz qanday yig'ilishi va ishlatilishi haqida to'liq ma'lumot uchun alohida Maxfiylik siyosati bilan tanishing.",
    ],
  },
  {
    title: "10. Shartlarning o'zgarishi",
    items: [
      "Platforma ushbu Shartlarni istalgan vaqtda yangilash huquqiga ega. Muhim o'zgarishlar haqida Foydalanuvchilarga platforma orqali xabar beriladi. Yangilangan Shartlardan keyin platformadan foydalanishni davom ettirish — ularga rozilik sifatida qaraladi.",
    ],
  },
  {
    title: "11. Bog'lanish",
    items: ["Ushbu Shartlar yuzasidan savollar bo'lsa, biz bilan bog'laning: +998-50-204-49-52"],
  },
];

export default function TermsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line p-6 pb-4">
          <h2 className="font-display text-lg font-medium text-ink-900">
            Foydalanish shartlari va qoidalari
          </h2>
          <p className="mt-2 text-xs text-muted-2">{INTRO}</p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-1.5 text-sm font-medium text-ink">
                {section.title}
              </h3>
              {section.items?.map((item) => (
                <p key={item} className="mb-1.5 text-sm text-muted">
                  {item}
                </p>
              ))}
              {section.list && (
                <>
                  {section.intro && (
                    <p className="mb-1.5 text-sm text-muted">{section.intro}</p>
                  )}
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                    {section.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-line p-6 pt-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-ink-700 py-2 text-sm font-medium text-paper-100 hover:bg-ink-900"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}