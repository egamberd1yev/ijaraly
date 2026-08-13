import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const SOCIAL_FIELDS = [
  { name: "instagram", label: "Instagram", placeholder: "https://instagram.com/foydalanuvchi" },
  { name: "telegram", label: "Telegram", placeholder: "https://t.me/foydalanuvchi" },
  { name: "facebook", label: "Facebook", placeholder: "https://facebook.com/foydalanuvchi" },
];

export default function Profile() {
  const { user, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    instagram: "",
    telegram: "",
    facebook: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Foydalanuvchi ma'lumoti kelganda formani to'ldiramiz
  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      instagram: user.socialLinks?.instagram || "",
      telegram: user.socialLinks?.telegram || "",
      facebook: user.socialLinks?.facebook || "",
    });
  }, [user]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await api.put("/auth/me", {
        fullName: form.fullName,
        phone: form.phone || null,
        socialLinks: {
          instagram: form.instagram,
          telegram: form.telegram,
          facebook: form.facebook,
        },
      });
      setUser(res.data.user);
      setSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        "Xatolik yuz berdi, qayta urinib ko'ring";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <div className="mb-6 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-lg font-medium text-[#4A2E06]">
          {user.fullName?.slice(0, 2).toUpperCase()}
        </div>
        <h1 className="font-display mt-3 text-2xl font-medium text-ink-900">
          Profil
        </h1>
        <p className="text-sm text-muted-2">{user.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4 rounded-xl border border-line bg-white p-4">
          <div>
            <label className="mb-1 block text-sm text-ink">To'liq ism</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink">Telefon</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+998901234567"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-white p-4">
          <p className="text-sm font-medium text-ink">Ijtimoiy tarmoqlar</p>
          <p className="-mt-3 text-xs text-muted-2">
            E'lonlaringizni ko'rgan foydalanuvchilar shu orqali siz bilan bog'lanishi mumkin
          </p>
          {SOCIAL_FIELDS.map((field) => (
            <div key={field.name}>
              <label className="mb-1 block text-sm text-ink">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-ink-700/10 px-3 py-2 text-sm text-ink-700">
            Profil saqlandi ✓
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-ink-700 py-2.5 text-sm font-medium text-paper-100 hover:bg-ink-900 disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}