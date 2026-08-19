import { useState } from "react";
import api from "../api/client";

// E'lon egasi ijarachi ma'lumotlarini kiritib, shartnoma PDF hosil qiladigan modal.
export default function ContractModal({ open, listingId, onClose, onCreated }) {
  const [form, setForm] = useState({
    renterFullName: "",
    renterPassport: "",
    renterPhone: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post(`/listings/${listingId}/contract`, form);
      onCreated(res.data.contract);
      setForm({
        renterFullName: "",
        renterPassport: "",
        renterPhone: "",
        startDate: "",
        endDate: "",
      });
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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-medium text-ink-900">
          Shartnoma tuzish
        </h2>
        <p className="mt-1 text-xs text-muted-2">
          Bu shablon amaliy asosda tuzilgan va professional yuridik
          tekshiruvni almashtirmaydi.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-ink">
              Ijarachining to'liq ismi
            </label>
            <input
              type="text"
              name="renterFullName"
              value={form.renterFullName}
              onChange={handleChange}
              required
              placeholder="Bekzod Yusupov"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-ink">
              Pasport seriya-raqami
            </label>
            <input
              type="text"
              name="renterPassport"
              value={form.renterPassport}
              onChange={handleChange}
              required
              placeholder="AB1234567"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-ink">
              Telefon <span className="text-muted-2">(ixtiyoriy)</span>
            </label>
            <input
              type="tel"
              name="renterPhone"
              value={form.renterPhone}
              onChange={handleChange}
              placeholder="+998901234567"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-ink">
                Boshlanish sanasi
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink">
                Tugash sanasi
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
              />
            </div>
          </div>

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
              disabled={submitting}
              className="flex-1 rounded-lg bg-ink-700 py-2 text-sm font-medium text-paper-100 hover:bg-ink-900 disabled:opacity-60"
            >
              {submitting ? "Yaratilmoqda..." : "Shartnoma yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}