// Foydalanish shartlari va qoidalari modali.
// Hozircha matn bo'sh/qisqa — to'liq matn keyinroq yoziladi.
export default function TermsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-medium text-ink-900">
          Foydalanish shartlari va qoidalari
        </h2>

        <div className="mt-4 space-y-3 text-sm text-muted">
          <p>
            Ijaraly platformasidan foydalanish shartlari va qoidalarining
            to'liq matni tez orada shu yerda joylashtiriladi.
          </p>
          <p>
            Ro'yxatdan o'tish orqali siz keyinchalik e'lon qilinadigan
            to'liq shartlarga rozilik bildirgan hisoblanasiz.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-ink-700 py-2 text-sm font-medium text-paper-100 hover:bg-ink-900"
        >
          Yopish
        </button>
      </div>
    </div>
  );
}