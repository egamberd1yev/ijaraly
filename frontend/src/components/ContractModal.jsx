import { useState, useEffect, useRef } from "react";
import { formatPrice } from "../utils/format";

// Pasport formati: 2 ta lotin harfi + 7 ta raqam (masalan AB1234567).
// Xorijiy fuqarolar uchun boshqa format kerak bo'lsa, shu regexni o'zgartiring.
const PASSPORT_REGEX = /^[A-Z]{2}[0-9]{7}$/;

const DURATION_OPTIONS = [
  { label: "1 oy", months: 1 },
  { label: "3 oy", months: 3 },
  { label: "6 oy", months: 6 },
  { label: "1 yil", months: 12 },
];

// ---------- Sana yordamchilari (mahalliy vaqt bilan, toISOString ishlatilmaydi:
// u soat mintaqasi tufayli sanani bir kunga surib yuborishi mumkin) ----------

function pad(n) {
  return String(n).padStart(2, "0");
}

function toInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "2026-01-31" + 1 oy = "2026-02-28" (oy oxiridan oshib ketmaydi)
function addMonths(dateStr, months) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const total = m - 1 + months;
  const year = y + Math.floor(total / 12);
  const month = total % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return `${year}-${pad(month + 1)}-${pad(Math.min(d, lastDay))}`;
}

function daysBetween(startStr, endStr) {
  const [y1, m1, d1] = startStr.split("-").map(Number);
  const [y2, m2, d2] = endStr.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

// ---------- Telefon maskasi: +998 (90) 123-45-67 ----------
// Ichkarida faqat 9 ta milliy raqam saqlanadi (masalan "901234567").

function formatPhone(digits) {
  if (!digits) return "";
  let out = `+998 (${digits.slice(0, 2)}`;
  if (digits.length >= 2) out += ") ";
  out += digits.slice(2, 5);
  if (digits.length > 5) out += `-${digits.slice(5, 7)}`;
  if (digits.length > 7) out += `-${digits.slice(7, 9)}`;
  return out;
}

function extractPhoneDigits(raw) {
  let digits = raw.replace(/\D/g, "");
  // Ko'rinishda doim "+998" turadi, shuning uchun boshidagi 998 ni olib tashlaymiz
  if (digits.startsWith("998")) digits = digits.slice(3);
  return digits.slice(0, 9);
}

// ---------- Tekshiruv ----------

function validate(v) {
  const errors = {};

  const name = v.fullName.trim().replace(/\s+/g, " ");
  if (!name) errors.fullName = "Ijarachining to'liq ismi kiritilishi shart";
  else if (name.split(" ").length < 2) errors.fullName = "Ism va familiyani to'liq kiriting";

  if (!v.passport) errors.passport = "Pasport seriya-raqami kiritilishi shart";
  else if (!PASSPORT_REGEX.test(v.passport))
    errors.passport = "Noto'g'ri format. Masalan: AB1234567";

  if (v.phoneDigits && v.phoneDigits.length !== 9)
    errors.phone = "Telefon raqamini to'liq kiriting";

  if (!v.startDate) errors.startDate = "Boshlanish sanasi kiritilishi shart";
  if (!v.endDate) errors.endDate = "Tugash sanasi kiritilishi shart";
  else if (v.startDate && v.endDate <= v.startDate)
    errors.endDate = "Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak";

  return errors;
}

// ---------- Kichik ikonkalar ----------

function Icon({ children, className = "" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const UserIcon = () => (
  <Icon>
    <path d="M20 21v-1a5 5 0 00-5-5H9a5 5 0 00-5 5v1" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const DocIcon = () => (
  <Icon>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </Icon>
);

const PhoneIcon = () => (
  <Icon>
    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" />
  </Icon>
);

const InfoIcon = () => (
  <Icon className="mt-0.5 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </Icon>
);

// ---------- Maydon o'rami ----------

function Field({ label, htmlFor, optional, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm text-ink">
        {label}
        {optional && <span className="text-muted-2"> (ixtiyoriy)</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClasses(hasError, withIcon = false) {
  return `w-full rounded-lg border bg-white py-2.5 text-sm text-ink outline-none transition-colors ${
    withIcon ? "pl-10 pr-3" : "px-3"
  } ${hasError ? "border-red-500 focus:border-red-600" : "border-line focus:border-ink-700"}`;
}

function openPicker(e) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // Ba'zi brauzerlarda showPicker qo'llab-quvvatlanmaydi — e'tibor bermaymiz
  }
}

// ---------- Asosiy modal ----------
// Props:
//   open      — modal ko'rinadimi
//   listing   — { address, price, currency } (yuqoridagi xulosa kartasi uchun, ixtiyoriy)
//   onSubmit  — async (payload) => {...}  API chaqiruvini shu yerda bajaring.
//               Xato tashlasa, xabar modal ichida ko'rsatiladi. Muvaffaqiyatli
//               tugasa, modal o'zi yopiladi.
//   onClose   — modalni yopish

export default function ContractModal({ open, listing, onSubmit, onClose }) {
  // Modal har ochilganda forma yangidan boshlanishi uchun ichki komponent alohida
  if (!open) return null;
  return <ModalBody listing={listing} onSubmit={onSubmit} onClose={onClose} />;
}

function ModalBody({ listing, onSubmit, onClose }) {
  const today = toInputValue(new Date());

  const [values, setValues] = useState({
    fullName: "",
    passport: "",
    phoneDigits: "",
    startDate: today,
    endDate: addMonths(today, 1),
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const nameRef = useRef(null);

  const errors = validate(values);
  const showError = (field) => (touched[field] || submitted ? errors[field] : undefined);

  // Ochilganda: ismga fokus, sahifa aylanishini to'xtatish, Escape bilan yopish
  useEffect(() => {
    nameRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, submitting]);

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleNameChange(e) {
    setValues((prev) => ({ ...prev, fullName: e.target.value }));
  }

  function handlePassportChange(e) {
    const cleaned = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 9);
    setValues((prev) => ({ ...prev, passport: cleaned }));
  }

  function handlePhoneChange(e) {
    const prevDigits = values.phoneDigits;
    let next = extractPhoneDigits(e.target.value);
    // Foydalanuvchi ")" yoki "-" kabi belgini o'chirsa, raqamlar o'zgarmaydi va
    // maydon qotib qolardi — shunda oxirgi raqamni o'chiramiz
    if (e.target.value.length < formatPhone(prevDigits).length && next === prevDigits) {
      next = prevDigits.slice(0, -1);
    }
    setValues((prev) => ({ ...prev, phoneDigits: next }));
  }

  // Muddat tugmalaridan biri tanlangan bo'lsa, boshlanish sanasi o'zgarganda
  // tugash sanasi ham shu muddatga mos siljiydi
  function activeMonths(start, end) {
    if (!start || !end) return null;
    const match = DURATION_OPTIONS.find((o) => addMonths(start, o.months) === end);
    return match ? match.months : null;
  }

  function handleStartChange(e) {
    const newStart = e.target.value;
    setValues((prev) => {
      const months = activeMonths(prev.startDate, prev.endDate);
      return {
        ...prev,
        startDate: newStart,
        endDate: months && newStart ? addMonths(newStart, months) : prev.endDate,
      };
    });
  }

  function handleEndChange(e) {
    setValues((prev) => ({ ...prev, endDate: e.target.value }));
  }

  function applyDuration(months) {
    if (!values.startDate) return;
    setValues((prev) => ({ ...prev, endDate: addMonths(prev.startDate, months) }));
    markTouched("endDate");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        renterFullName: values.fullName.trim().replace(/\s+/g, " "),
        renterPassport: values.passport,
        // Backend faqat raqamlarni qabul qiladi: "+998901234567" yoki null
        renterPhone: values.phoneDigits.length === 9 ? `+998${values.phoneDigits}` : null,
        startDate: values.startDate,
        endDate: values.endDate,
      });
      onClose();
    } catch (err) {
      setServerError(
        err?.response?.data?.errors?.[0] ||
          err?.response?.data?.message ||
          "Shartnomani yaratib bo'lmadi, qayta urinib ko'ring"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const currentMonths = activeMonths(values.startDate, values.endDate);
  const totalDays =
    values.startDate && values.endDate && values.endDate > values.startDate
      ? daysBetween(values.startDate, values.endDate)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-modal-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-paper-100 p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        {/* Sarlavha */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id="contract-modal-title"
            className="font-display text-xl font-medium text-ink-900"
          >
            Shartnoma tuzish
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Yopish"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-muted hover:bg-paper-200 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Ogohlantirish */}
        <div className="mb-4 flex gap-2 rounded-lg border border-gold-500/30 bg-gold-100 px-3 py-2.5 text-xs text-ink">
          <InfoIcon />
          <p>Bu shablon amaliy asosda tuzilgan va professional yuridik tekshiruvni almashtirmaydi.</p>
        </div>

        {/* Uy xulosasi */}
        {listing && (
          <div className="mb-4 rounded-lg border border-line bg-paper-200 px-3 py-2.5">
            <p className="text-xs text-muted-2">Shartnoma tuziladigan uy</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{listing.address}</p>
            {listing.price != null && (
              <p className="mt-0.5 text-sm text-ink-700">
                {formatPrice(listing.price, listing.currency)} / oyiga
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Ijarachining ismi */}
          <Field
            label="Ijarachining to'liq ismi"
            htmlFor="renter-name"
            error={showError("fullName")}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <UserIcon />
              </span>
              <input
                ref={nameRef}
                id="renter-name"
                type="text"
                value={values.fullName}
                onChange={handleNameChange}
                onBlur={() => markTouched("fullName")}
                maxLength={150}
                autoComplete="off"
                placeholder="Ism Familiya"
                aria-invalid={!!showError("fullName")}
                className={inputClasses(!!showError("fullName"), true)}
              />
            </div>
          </Field>

          {/* Pasport */}
          <Field
            label="Pasport seriya-raqami"
            htmlFor="renter-passport"
            error={showError("passport")}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <DocIcon />
              </span>
              <input
                id="renter-passport"
                type="text"
                value={values.passport}
                onChange={handlePassportChange}
                onBlur={() => markTouched("passport")}
                autoComplete="off"
                autoCapitalize="characters"
                placeholder="AB1234567"
                aria-invalid={!!showError("passport")}
                className={`${inputClasses(!!showError("passport"), true)} uppercase`}
              />
            </div>
          </Field>

          {/* Telefon */}
          <Field
            label="Telefon"
            htmlFor="renter-phone"
            optional
            error={showError("phone")}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <PhoneIcon />
              </span>
              <input
                id="renter-phone"
                type="tel"
                inputMode="numeric"
                value={formatPhone(values.phoneDigits)}
                onChange={handlePhoneChange}
                onBlur={() => markTouched("phone")}
                autoComplete="off"
                placeholder="+998 (__) ___-__-__"
                aria-invalid={!!showError("phone")}
                className={inputClasses(!!showError("phone"), true)}
              />
            </div>
          </Field>

          {/* Sanalar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Boshlanish sanasi"
              htmlFor="contract-start"
              error={showError("startDate")}
            >
              <input
                id="contract-start"
                type="date"
                value={values.startDate}
                onChange={handleStartChange}
                onBlur={() => markTouched("startDate")}
                onClick={openPicker}
                aria-invalid={!!showError("startDate")}
                className={inputClasses(!!showError("startDate"))}
              />
            </Field>
            <Field
              label="Tugash sanasi"
              htmlFor="contract-end"
              error={showError("endDate")}
            >
              <input
                id="contract-end"
                type="date"
                value={values.endDate}
                min={values.startDate || undefined}
                onChange={handleEndChange}
                onBlur={() => markTouched("endDate")}
                onClick={openPicker}
                aria-invalid={!!showError("endDate")}
                className={inputClasses(!!showError("endDate"))}
              />
            </Field>
          </div>

          {/* Tez muddat tugmalari */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-2">Muddat:</span>
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => applyDuration(opt.months)}
                  disabled={!values.startDate}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    currentMonths === opt.months
                      ? "border-gold-600 bg-gold-100 text-gold-600"
                      : "border-line bg-white text-muted hover:border-ink-700/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {totalDays !== null && (
              <p className="mt-1.5 text-xs text-muted-2">Jami: {totalDays} kun</p>
            )}
          </div>

          {/* Server xatosi */}
          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          {/* Tugmalar */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-lg border border-line bg-white py-2.5 text-sm text-muted hover:bg-paper-200 disabled:opacity-60"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-gold-500 py-2.5 text-sm font-medium text-[#4A2E06] hover:bg-gold-600 disabled:opacity-60"
            >
              {submitting ? "Yaratilmoqda..." : "Shartnoma yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}