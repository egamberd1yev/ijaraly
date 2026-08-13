import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { getImageUrl } from "../api/getImageUrl";
import { formatPrice } from "../utils/format";

const SOCIAL_LABELS = {
  instagram: "Instagram",
  telegram: "Telegram",
  facebook: "Facebook",
};

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    setActiveImage(0);
    api
      .get(`/listings/${id}`)
      .then((res) => setListing(res.data.listing))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError("E'lon topilmadi");
        } else {
          setError("E'lonni yuklab bo'lmadi");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCopyPhone(phone) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API ishlamasa (masalan http muhitda), jim o'tamiz —
      // foydalanuvchi baribir raqamni ko'rib, qo'lda yozib olishi mumkin
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-muted">Yuklanmoqda...</p>;
  }

  if (error || !listing) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-700">{error || "E'lon topilmadi"}</p>
        <Link to="/" className="mt-3 inline-block text-sm text-ink-700 hover:underline">
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  const images = listing.images || [];
  const owner = listing.owner || {};
  const socialLinks = owner.socialLinks || {};
  const hasSocialLinks = Object.values(socialLinks).some((v) => v);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/" className="text-sm text-ink-700 hover:underline">
        ← Bosh sahifaga qaytish
      </Link>

      {/* Rasm galereyasi */}
      <div className="mt-4">
        <div className="h-72 overflow-hidden rounded-xl bg-linear-to-br from-ink-500 to-ink-900 sm:h-96">
          {images[activeImage] && (
            <img
              src={getImageUrl(images[activeImage])}
              alt={listing.address}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-2 flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${i === activeImage ? "border-ink-700" : "border-transparent"
                  }`}
              >
                <img
                  src={getImageUrl(img)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {/* Asosiy ma'lumot */}
        <div className="sm:col-span-2">
          <h1 className="font-display text-2xl font-medium text-ink-900">
            {listing.address}
          </h1>
          <p className="mt-1 text-xl font-medium text-ink-700">
            {formatPrice(listing.price, listing.currency)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{listing.renovationType === "yevro" ? "Yevro remont" : "Oddiy remont"}</Badge>
            <Badge>{listing.roomCount} hona</Badge>
            {listing.hasGas && <Badge>Gaz bor</Badge>}
            {listing.hasWater && <Badge>Suv bor</Badge>}
            {listing.hasElectricity && <Badge>Svet bor</Badge>}
            {listing.hasFurniture && <Badge>Texnika-jihoz bor</Badge>}
          </div>

          {listing.description && (
            <div className="mt-6">
              <h2 className="mb-1.5 text-sm font-medium text-ink">
                Qo'shimcha ma'lumot
              </h2>
              <p className="whitespace-pre-line text-sm text-muted">
                {listing.description}
              </p>
            </div>
          )}
        </div>

        {/* Egasi bilan bog'lanish */}
        <div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-ink">E'lon egasi</h2>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-xs font-medium text-[#4A2E06]">
                {owner.fullName?.slice(0, 2).toUpperCase() || "??"}
              </div>
              <p className="text-sm font-medium text-ink">{owner.fullName}</p>
            </div>

            {owner.phone && (
              <button
                type="button"
                onClick={() => handleCopyPhone(owner.phone)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink-700 py-2 text-sm font-medium text-paper-100 hover:bg-ink-900"
              >
                {copied ? (
                  "Nusxalandi ✓"
                ) : (
                  <>
                    {owner.phone}
                    <CopyIcon />
                  </>
                )}
              </button>
            )}

            {hasSocialLinks && (
              <div className="mt-3 flex flex-col gap-1.5">
                {Object.entries(socialLinks).map(([key, value]) => {
                  if (!value) return null;
                  const label = SOCIAL_LABELS[key] || key;
                  const isLink = value.startsWith("http");

                  // Havoladan foydalanuvchi nikini ajratib olish:
                  // Oxiridagi sleshni (/) olib tashlaymiz va '/' ga bo'lib oxirgi elementni olamiz
                  const displayValue = isLink ? value.replace(/\/$/, "").split("/").pop() : value;

                  return (
                    <div key={key} className="text-sm flex flex-wrap gap-1">
                      <span className="text-muted-2">{label}: </span>
                      {isLink ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="text-ink-700 hover:underline truncate max-w-full"
                          title={value}
                        >
                          @{displayValue}
                        </a>
                      ) : (
                        <span className="text-ink truncate max-w-full">{value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>  
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-line bg-paper-200 px-3 py-1 text-xs text-ink">
      {children}
    </span>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}