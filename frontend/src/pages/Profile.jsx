import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", usernamePlaceholder: "foydalanuvchi", urlPlaceholder: "https://instagram.com/foydalanuvchi" },
  { key: "telegram", label: "Telegram", usernamePlaceholder: "foydalanuvchi", urlPlaceholder: "https://t.me/foydalanuvchi" },
  { key: "facebook", label: "Facebook", usernamePlaceholder: "Aziz Aripov", urlPlaceholder: "https://facebook.com/foydalanuvchi" },
];

const EMPTY_SOCIAL = { instagram: { username: "", url: "" }, telegram: { username: "", url: "" }, facebook: { username: "", url: "" } };

export default function Profile() {
  const { user, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  // Har bir tarmoq uchun { username, url } — profil formasida ikkita alohida input
  const [social, setSocial] = useState(EMPTY_SOCIAL);

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
    setFullName(user.fullName || "");
    setPhone(user.phone || "");
    setSocial({
      instagram: { ...EMPTY_SOCIAL.instagram, ...(user.socialLinks?.instagram || {}) },
      telegram: { ...EMPTY_SOCIAL.telegram, ...(user.socialLinks?.telegram || {}) },
      facebook: { ...EMPTY_SOCIAL.facebook, ...(user.socialLinks?.facebook || {}) },
    });
  }, [user]);

  function handleSocialChange(platform, field, value) {
    setSocial((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value },
    }));
    setSuccess(false);
  }

  // Foydalanuvchi "t.me/foydalanuvchi" kabi https:// siz yozsa ham,
  // saqlashdan oldin avtomatik to'g'rilaymiz — aks holda backend
  // "noto'g'ri link" deb rad etadi
  function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const normalizedSocial = {
        instagram: { ...social.instagram, url: normalizeUrl(social.instagram.url) },
        telegram: { ...social.telegram, url: normalizeUrl(social.telegram.url) },
        facebook: { ...social.facebook, url: normalizeUrl(social.facebook.url) },
      };

      const res = await api.put("/auth/me", {
        fullName,
        phone: phone || null,
        socialLinks: normalizedSocial,
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998901234567"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>
        </div>

        <div className="space-y-5 rounded-xl border border-line bg-white p-4">
          <div>
            <p className="text-sm font-medium text-ink">Ijtimoiy tarmoqlar</p>
            <p className="mt-0.5 text-xs text-muted-2">
              Nikni kiriting — e'lon sahifasida shu nik ko'rinadi va bosilganda linkka olib boradi
            </p>
          </div>

          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key} className="space-y-2 border-t border-line pt-4 first:border-t-0 first:pt-0">
              <p className="text-sm font-medium text-ink">{platform.label}</p>
              <div>
                <label className="mb-1 block text-xs text-muted">Nik / ism</label>
                <input
                  type="text"
                  value={social[platform.key].username}
                  onChange={(e) => handleSocialChange(platform.key, "username", e.target.value)}
                  placeholder={platform.usernamePlaceholder}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Link</label>
                <input
                  type="text"
                  value={social[platform.key].url}
                  onChange={(e) => handleSocialChange(platform.key, "url", e.target.value)}
                  placeholder={platform.urlPlaceholder}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
                />
              </div>
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