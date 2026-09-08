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
    listedBy: "owner",
    commissionPercent: "",
    suitableFor: "",
    childrenAllowed: null,
    studentGender: "",
    maxStudents: "",
    petsAllowed: null,
    description: "",
  });

  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function handleIntegerKeyDown(e) {
    if (["-", "+", "e", "E", "."].includes(e.key)) {
      e.preventDefault();
    }
  }

  function handleRoomCountChange(e) {
    setForm({ ...form, roomCount: e.target.value.replace(/[^0-9]/g, "") });
  }

  function handlePriceChange(e) {
    setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, "") });
  }

  function handleMaxStudentsChange(e) {
    setForm({ ...form, maxStudents: e.target.value.replace(/[^0-9]/g, "") });
  }

  function handleSuitableForChange(value) {
    setForm({
      ...form,
      suitableFor: value,
      childrenAllowed: null,
      studentGender: "",
      maxStudents: "",
    });
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
    if (!form.suitableFor) {
      setError("Uy kimlar uchun ekanini tanlang");
      return;
    }
    if (form.suitableFor === "oila" && form.childrenAllowed === null) {
      setError("Yosh bolali oilalarga ruxsat borligini belgilang");
      return;
    }
    if (form.suitableFor === "talaba" && (!form.studentGender || !form.maxStudents)) {
      setError("Talabalar uchun jinsi va maksimal sonini kiriting");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrls = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img.file));
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrls = uploadRes.data.urls;
      }

      // DIQQAT: "suitableFor"ga tegishli bo'lmagan har bir maydonni bu yerda
      // ANIQ "null" qilib yuboramiz — bo'sh satr ("") emas. Bu xatoning oldini
      // olish uchun eng ishonchli yo'l, chunki backend ham endi buni qo'shimcha
      // qabul qiladi, lekin frontend'ning o'zi ham toza ma'lumot yuborishi kerak.
      await api.post("/listings", {
        ...form,
        roomCount: Number(form.roomCount),
        price: Number(form.price),
        commissionPercent:
          form.listedBy === "agent" ? Number(form.commissionPercent) : null,
        childrenAllowed: form.suitableFor === "oila" ? form.childrenAllowed : null,
        studentGender: form.suitableFor === "talaba" ? form.studentGender : null,
        maxStudents: form.suitableFor === "talaba" ? Number(form.maxStudents) : null,
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
          {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
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
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm capitalize ${
                  form.renovationType === type
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

        {/* Kim joylayotgani */}
        <div>
          <label className="mb-1 block text-sm text-ink">Kim joylayotgan</label>
          <div className="flex gap-3">
            {[
              { value: "owner", label: "Men mulk egasiman" },
              { value: "agent", label: "Men vositachiman" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm ${
                  form.listedBy === opt.value
                    ? "border-ink-700 bg-ink-700 text-paper-100"
                    : "border-line bg-white text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="listedBy"
                  value={opt.value}
                  checked={form.listedBy === opt.value}
                  onChange={handleChange}
                  className="hidden"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {form.listedBy === "agent" && (
            <div className="mt-3">
              <label className="mb-1 block text-sm text-ink">Komissiya foizi (%)</label>
              <input
                type="text"
                name="commissionPercent"
                value={form.commissionPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    commissionPercent: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                onKeyDown={handleIntegerKeyDown}
                required
                inputMode="numeric"
                placeholder="masalan 30"
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
              />
            </div>
          )}
        </div>

        {/* Ijara shartlari — kimlarga mos */}
        <div className="rounded-lg border border-line bg-paper-200 p-4">
          <label className="mb-1 block text-sm font-medium text-ink">
            Uy kimlar uchun <span className="text-red-600">*</span>
          </label>
          <p className="mb-2 text-xs text-muted-2">
            Bu shartlar qidiruvda ko'rsatiladi — ijarachi qo'ng'iroq qilishdan oldin biladi
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "oila", label: "Oila" },
              { value: "talaba", label: "Talaba" },
              { value: "farqi_yoq", label: "Farqi yo'q" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm ${
                  form.suitableFor === opt.value
                    ? "border-ink-700 bg-ink-700 text-paper-100"
                    : "border-line bg-white text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="suitableFor"
                  value={opt.value}
                  checked={form.suitableFor === opt.value}
                  onChange={() => handleSuitableForChange(opt.value)}
                  className="hidden"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {form.suitableFor === "oila" && (
            <div className="mt-3">
              <label className="mb-1 block text-sm text-ink">
                Yosh bolali oilalarga ruxsatmi?
              </label>
              <div className="flex gap-3">
                {[
                  { value: true, label: "Ha" },
                  { value: false, label: "Yo'q" },
                ].map((opt) => (
                  <label
                    key={String(opt.value)}
                    className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
                      form.childrenAllowed === opt.value
                        ? "border-ink-700 bg-ink-700 text-paper-100"
                        : "border-line bg-white text-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="childrenAllowed"
                      checked={form.childrenAllowed === opt.value}
                      onChange={() => setForm({ ...form, childrenAllowed: opt.value })}
                      className="hidden"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {form.suitableFor === "talaba" && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-ink">Jinsi</label>
                <div className="flex gap-2">
                  {[
                    { value: "ogil", label: "O'g'il bola" },
                    { value: "qiz", label: "Qiz bola" },
                    { value: "farqi_yoq", label: "Farqi yo'q" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex-1 cursor-pointer rounded-lg border px-2 py-2 text-center text-xs ${
                        form.studentGender === opt.value
                          ? "border-ink-700 bg-ink-700 text-paper-100"
                          : "border-line bg-white text-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="studentGender"
                        value={opt.value}
                        checked={form.studentGender === opt.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-ink">
                  Nechta talabagacha mumkin
                </label>
                <input
                  type="text"
                  value={form.maxStudents}
                  onChange={handleMaxStudentsChange}
                  onKeyDown={handleIntegerKeyDown}
                  inputMode="numeric"
                  placeholder="masalan 2"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
                />
              </div>
            </div>
          )}

          <div className="mt-3">
            <label className="mb-1 block text-sm text-ink">
              Uy hayvoni bilan yashash mumkinmi?{" "}
              <span className="text-muted-2">(ixtiyoriy)</span>
            </label>
            <div className="flex gap-2">
              {[
                { value: null, label: "Belgilanmagan" },
                { value: true, label: "Ha, mumkin" },
                { value: false, label: "Yo'q" },
              ].map((opt) => (
                <label
                  key={String(opt.value)}
                  className={`flex-1 cursor-pointer rounded-lg border px-2 py-2 text-center text-xs ${
                    form.petsAllowed === opt.value
                      ? "border-ink-700 bg-ink-700 text-paper-100"
                      : "border-line bg-white text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="petsAllowed"
                    checked={form.petsAllowed === opt.value}
                    onChange={() => setForm({ ...form, petsAllowed: opt.value })}
                    className="hidden"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
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
                    className={`px-3 text-sm ${
                      form.currency === opt.value
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
            Qo'shimcha ma'lumot <span className="text-muted-2">(ixtiyoriy)</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Metro yaqin, yorug' xonalar..."
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
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