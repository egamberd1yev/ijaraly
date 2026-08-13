// Oddiy tasdiqlash modali — "O'chirish" kabi xavfli amallar uchun.
// onConfirm — "Ha" bosilganda, onCancel — orqa fonga bosilganda yoki "Yo'q" bosilganda chaqiriladi.
export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Ha, o'chirish",
  cancelText = "Bekor qilish",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-medium text-ink-900">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-muted">{description}</p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-line py-2 text-sm text-ink hover:bg-paper-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}