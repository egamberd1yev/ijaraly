import { useState } from "react";
import api from "../api/client";

export default function ReportModal({ open, targetUserId, onClose, onSubmitted }) {
  const [reason, setReason] = useState("");
  const [affirmedTruth, setAffirmedTruth] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Checkbox belgilanmagan bo'lsa, shikoyat umuman yuborilmaydi
    if (!affirmedTruth) {
      setError("Yozganlaringiz haqiqat ekanligini tasdiqlashingiz kerak");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/users/${targetUserId}/report`, { reason, affirmedTruth });
      onSubmitted();
      setReason("");
      setAffirmedTruth(false);
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        "Xatolik yuz berdi, qayta urinib ko'ring";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-medium text-ink-900">
          Shikoyat qilish
        </h2>
        <p className="mt-1 text-xs text-muted-2">
          Shikoyatingiz anonim qoladi — kim shikoyat qilganini profil egasi
          bilmaydi.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-ink">
              Shikoyat sababi
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              placeholder="Nima uchun shikoyat qilyapsiz? Batafsil yozing..."
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={affirmedTruth}
              onChange={(e) => setAffirmedTruth(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-ink-700"
            />
            <span>
              Yuqorida yozganlarimning barchasi haqiqat. Agar buni
              tasdiqlamasam, yozganlarim yolg'on hisoblanadi.
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-line py-2 text-sm text-ink hover:bg-paper-200"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting || !affirmedTruth}
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? "Yuborilmoqda..." : "Shikoyat yuborish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}