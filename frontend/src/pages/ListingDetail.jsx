import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { getImageUrl } from "../api/getImageUrl";
import { formatPrice } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ContractModal from "../components/ContractModal";

const SOCIAL_LABELS = { instagram: "Instagram", telegram: "Telegram", facebook: "Facebook" };
const SUITABLE_LABELS = { oila: "Oilalar uchun", talaba: "Talabalar uchun", farqi_yoq: "Hammaga mos" };
const STUDENT_GENDER_LABELS = { ogil: "O'g'il bolalar", qiz: "Qiz bolalar", farqi_yoq: "Jinsi farqi yo'q" };

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [createdContractUrl, setCreatedContractUrl] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    setActiveImage(0);
    api
      .get(`/listings/${id}`)
      .then((res) => setListing(res.data.listing))
      .catch((err) => {
        setError(err.response?.status === 404 ? "E'lon topilmadi" : "E'lonni yuklab bo'lmadi");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCopyPhone(phone) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard ishlamasa jim o'tamiz
    }
  }

  if (loading) return <p className="py-16 text-center text-muted">Yuklanmoqda...</p>;

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
  const hasSocialLinks = Object.values(socialLinks).some((data) => data?.username || data?.url);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/" className="text-sm text-ink-700 hover:underline">
        ← Bosh sahifaga qaytish
      </Link>

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
                className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                  i === activeImage ? "border-ink-700" : "border-transparent"
                }`}
              >
                <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <h1 className="font-display text-2xl font-medium text-ink-900">{listing.address}</h1>
          <p className="mt-1 text-xl font-medium text-ink-700">
            {formatPrice(listing.price, listing.currency)}
          </p>

          <div className="mt-2">
            {listing.listedBy === "agent" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-medium text-gold-600">
                Vositachi orqali • Komissiya: {listing.commissionPercent}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-700/10 px-3 py-1 text-xs font-medium text-ink-700">
                Bevosita mulk egasidan
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{listing.renovationType === "yevro" ? "Yevro remont" : "Oddiy remont"}</Badge>
            <Badge>{listing.roomCount} hona</Badge>
            {listing.hasGas && <Badge>Gaz bor</Badge>}
            {listing.hasWater && <Badge>Suv bor</Badge>}
            {listing.hasElectricity && <Badge>Svet bor</Badge>}
            {listing.hasFurniture && <Badge>Texnika-jihoz bor</Badge>}
          </div>

          {/* Ijara shartlari */}
          <div className="mt-4">
            <h2 className="mb-1.5 text-sm font-medium text-ink">Ijara shartlari</h2>
            <div className="flex flex-wrap gap-2">
              <Badge tone="gold">{SUITABLE_LABELS[listing.suitableFor] || "Hammaga mos"}</Badge>

              {listing.suitableFor === "oila" && (
                <Badge tone="gold">
                  {listing.childrenAllowed ? "Yosh bolali oilalar mumkin" : "Bolasiz oilalar uchun"}
                </Badge>
              )}

              {listing.suitableFor === "talaba" && (
                <>
                  <Badge tone="gold">{STUDENT_GENDER_LABELS[listing.studentGender]}</Badge>
                  {listing.maxStudents && (
                    <Badge tone="gold">Ko'pi bilan {listing.maxStudents} talaba</Badge>
                  )}
                </>
              )}

              {listing.petsAllowed === true && <Badge tone="gold">Uy hayvoni bilan mumkin</Badge>}
              {listing.petsAllowed === false && <Badge tone="gold">Uy hayvoni bilan mumkin emas</Badge>}
            </div>
          </div>

          {listing.description && (
            <div className="mt-6">
              <h2 className="mb-1.5 text-sm font-medium text-ink">Qo'shimcha ma'lumot</h2>
              <p className="whitespace-pre-line text-sm text-muted">{listing.description}</p>
            </div>
          )}
        </div>

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
                {copied ? "Nusxalandi ✓" : owner.phone}
              </button>
            )}

            {hasSocialLinks && (
              <div className="mt-3 flex flex-col gap-1.5">
                {Object.entries(socialLinks).map(([key, data]) => {
                  const username = data?.username;
                  const url = data?.url;
                  if (!username && !url) return null;
                  const label = SOCIAL_LABELS[key] || key;
                  const displayText = username || url;
                  return (
                    <div key={key} className="text-sm">
                      <span className="text-muted-2">{label}: </span>
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="text-ink-700 hover:underline">
                          {displayText}
                        </a>
                      ) : (
                        <span className="text-ink">{displayText}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {user && listing.owner?.id === user.id && (
            <div className="mt-4 rounded-xl border border-line bg-white p-4">
              <h2 className="mb-1 text-sm font-medium text-ink">Ijara shartnomasi</h2>
              <p className="mb-3 text-xs text-muted-2">
                Ijarachi bilan standart shartnoma tuzib, PDF shaklida yuklab oling.
              </p>
              <button
                onClick={() => setShowContractModal(true)}
                className="w-full rounded-lg bg-ink-700 py-2 text-sm font-medium text-paper-100 hover:bg-ink-900"
              >
                Shartnoma tuzish
              </button>
              {createdContractUrl && (
                <a
                  href={getImageUrl(createdContractUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block rounded-lg bg-gold-100 py-2 text-center text-sm font-medium text-gold-600 hover:bg-gold-500/20"
                >
                  Shartnoma tayyor — yuklab olish
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <ContractModal
        open={showContractModal}
        listingId={listing.id}
        onClose={() => setShowContractModal(false)}
        onCreated={(contract) => {
          setCreatedContractUrl(contract.pdfUrl);
          setShowContractModal(false);
        }}
      />
    </div>
  );
}

function Badge({ children, tone }) {
  const classes =
    tone === "gold"
      ? "border-gold-500/40 bg-gold-100 text-gold-600"
      : "border-line bg-paper-200 text-ink";
  return <span className={`rounded-full border px-3 py-1 text-xs ${classes}`}>{children}</span>;
}