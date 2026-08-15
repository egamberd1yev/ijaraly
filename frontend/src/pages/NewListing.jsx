import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const MAX_IMAGES = 4;

export default function NewListing() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    address: "",
    renovationType: "oddiy",
    hasGas: false,
    hasWater: false,
    hasElectricity: false,
    hasFurniture: false,
    roomCount: "",
    price: "",
    currency: "som",
    description: "",
  });

  // Har bir rasm { file, previewUrl } shaklida saqlanadi,
  // shunda alohida rasmni topib o'chirish oson bo'ladi
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Login qilinmagan foydalanuvchini kirish sahifasiga yo'naltiramiz
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  // Faqat musbat butun songa ruxsat beradi — "-", "+", "e", "." kabi
  // belgilarni tugma bosilgan zahoti bloklaydi (raqamli input'da ular
  // brauzer tomonidan yozishga ruxsat berilgan, lekin bizga kerak emas)
  function handleIntegerKeyDown(e) {
    if (["-", "+", "e", "E", "."].includes(e.key)) {
      e.preventDefault();
    }
  }

  // Agar foydalanuvchi qiymatni joylashtirsa (paste) yoki boshqa yo'l bilan
  // manfiy/o'nlik son kirsa, bu yerda yakuniy tozalash amalga oshadi
  function handleRoomCountChange(e) {
    const cleaned = e.target.value.replace(/[^0-9]/g, "");
    setForm({ ...form, roomCount: cleaned });
  }

  function handlePriceChange(e) {
    const cleaned = e.target.value.replace(/[^0-9]/g, "");
    setForm({ ...form, price: cleaned });
  }

  function handleFilesChange(e) {
    const selected = Array.from(e.target.files);
    const availableSlots = MAX_IMAGES - images.length;

    if (selected.length > availableSlots) {
      setImageError(`Ko'pi bilan ${MAX_IMAGES} ta rasm yuklash mumkin`);
    } else {
      setImageError("");
    }

    const toAdd = selected.slice(0, availableSlots).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...toAdd]);
    // Input'ni tozalaymiz, shunda xohlasa xuddi shu faylni qayta tanlashi mumkin
    e.target.value = "";
  }

  function removeImage(index) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setImageError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.roomCount || Number(form.roomCount) < 1) {
      setError("Honalar soni kamida 1 bo'lishi kerak");
      return;
    }

    setSubmitting(true);

    try {
      // 1-qadam: rasmlar tanlangan bo'lsa, avval ularni yuklaymiz
      let imageUrls = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img.file));
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrls = uploadRes.data.urls;
      }

      // 2-qadam: e'lonni rasm URL'lari bilan birga yaratamiz
      await api.post("/listings", {
        ...form,
        roomCount: Number(form.roomCount),
        price: Number(form.price),
        images: imageUrls,
      });

      navigate("/dashboard");
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

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-center text-2xl font-medium text-ink-900">
        Yangi e'lon qo'yish
      </h1>
      <p className="mt-1 text-center text-sm text-muted">
        Uyingiz haqida ma'lumot kiriting
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Rasmlar */}
        <div>
          <label className="mb-1 block text-sm text-ink">
            Rasmlar <span className="text-muted-2">(ko'pi bilan {MAX_IMAGES} ta)</span>
          </label>

          {images.length < MAX_IMAGES && (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFilesChange}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-ink-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-paper-100"
            />
          )}

          {imageError && (
            <p className="mt-1 text-xs text-red-600">{imageError}</p>
          )}

          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="group relative h-20 w-20">
                  <img
                    src={img.previewUrl}
                    alt="Ko'rinish"
                    className="h-20 w-20 rounded-lg border border-line object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Rasmni o'chirish"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs leading-none text-white shadow hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manzil */}
        <div>
          <label className="mb-1 block text-sm text-ink">Manzil</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Toshkent, Chilonzor, 3 kichik daha"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
          />
        </div>

        {/* Remont turi */}
        <div>
          <label className="mb-1 block text-sm text-ink">Remont turi</label>
          <div className="flex gap-3">
            {["oddiy", "yevro"].map((type) => (
              <label
                key={type}
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm capitalize ${form.renovationType === type
                    ? "border-ink-700 bg-ink-700 text-paper-100"
                    : "border-line bg-white text-ink"
                  }`}
              >
                <input
                  type="radio"
                  name="renovationType"
                  value={type}
                  checked={form.renovationType === type}
                  onChange={handleChange}
                  className="hidden"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Sharoit va jihoz */}
        <div>
          <label className="mb-2 block text-sm text-ink">Sharoit va jihoz</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "hasGas", label: "Gaz bor" },
              { name: "hasWater", label: "Suv bor" },
              { name: "hasElectricity", label: "Svet bor" },
              { name: "hasFurniture", label: "Texnika-jihoz bor" },
            ].map((item) => (
              <label
                key={item.name}
                className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink"
              >
                <input
                  type="checkbox"
                  name={item.name}
                  checked={form[item.name]}
                  onChange={handleChange}
                  className="h-4 w-4 accent-ink-700"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        {/* Hona soni va narx */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-ink">Honalar soni</label>
            <input
              type="text"
              name="roomCount"
              value={form.roomCount}
              onChange={handleRoomCountChange}
              onKeyDown={handleIntegerKeyDown}
              required
              inputMode="numeric"
              placeholder="3"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink">Narx</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handlePriceChange}
                onKeyDown={handleIntegerKeyDown}
                required
                inputMode="numeric"
                placeholder={form.currency === "dollar" ? "450" : "4500000"}
                className="w-full min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
              />
              <div className="flex shrink-0 overflow-hidden rounded-lg border border-line">
                {[
                  { value: "som", label: "so'm" },
                  { value: "dollar", label: "$" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, currency: opt.value })}
                    className={`px-3 text-sm ${form.currency === opt.value
                        ? "bg-ink-700 text-paper-100"
                        : "bg-white text-muted"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Qo'shimcha ma'lumot */}
        <div>
          <label className="mb-1 block text-sm text-ink">
            Uyning aniq malumotlari Masalan: Uyning aniq manzili, Honalar olchami ...  <span className="text-muted-2">(majburiy)</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            required={true}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gold-500 py-2.5 text-sm font-medium text-[#4A2E06] hover:bg-gold-600 disabled:opacity-60"
        >
          {submitting ? "Joylanmoqda..." : "E'lonni joylash"}
        </button>
      </form>
    </div>
  );
}