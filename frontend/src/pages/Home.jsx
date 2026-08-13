import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { getImageUrl } from "../api/getImageUrl";

const ROOM_OPTIONS = [1, 2, 3, 4, 5];
const PAGE_LIMIT = 12;

export default function Home() {
  // Qidiruv input'i alohida saqlanadi, faqat submit bosilganda "appliedAddress"ga o'tadi.
  // Shunda har bir harf kiritilganda emas, faqat qidiruv bosilganda so'rov ketadi.
  const [addressInput, setAddressInput] = useState("");
  const [appliedAddress, setAppliedAddress] = useState("");

  const [renovationType, setRenovationType] = useState(null); // "oddiy" | "yevro" | null
  const [allUtilities, setAllUtilities] = useState(false);
  const [hasFurniture, setHasFurniture] = useState(false);
  const [roomCount, setRoomCount] = useState(null);

  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const buildParams = useCallback(
    (pageNum) => {
      const params = { page: pageNum, limit: PAGE_LIMIT };
      if (appliedAddress) params.address = appliedAddress;
      if (renovationType) params.renovationType = renovationType;
      if (allUtilities) {
        params.hasGas = true;
        params.hasWater = true;
        params.hasElectricity = true;
      }
      if (hasFurniture) params.hasFurniture = true;
      if (roomCount) params.roomCount = roomCount;
      return params;
    },
    [appliedAddress, renovationType, allUtilities, hasFurniture, roomCount]
  );

  // Filterlar o'zgarganda 1-sahifadan qayta yuklaymiz
  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/listings", { params: buildParams(1) })
      .then((res) => {
        setListings(res.data.listings);
        setPage(1);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setError("E'lonlarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [buildParams]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setAppliedAddress(addressInput.trim());
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get("/listings", { params: buildParams(nextPage) });
      setListings((prev) => [...prev, ...res.data.listings]);
      setPage(nextPage);
    } catch {
      setError("Qo'shimcha e'lonlarni yuklab bo'lmadi");
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleRenovation(type) {
    setRenovationType((prev) => (prev === type ? null : type));
  }

  function toggleRoomCount(count) {
    setRoomCount((prev) => (prev === count ? null : count));
  }

  const chipBase =
    "rounded-full border px-3.5 py-1.5 text-xs transition-colors cursor-pointer select-none";
  const chipActive = "border-gold-600 bg-gold-100 text-gold-600";
  const chipInactive = "border-line text-muted hover:border-ink-700/40";

  return (
    <div>
      {/* Hero + qidiruv */}
      <div className="px-6 pb-6 pt-12 text-center">
        <h1 className="font-display text-2xl font-medium text-ink-900 sm:text-3xl">
          Uzoq muddatga ijara — ishonchli va oddiy
        </h1>
        <p className="mt-1 text-sm text-muted">
          O'zbekistondagi minglab uylardan o'zingizga mosini toping
        </p>

        <form
          onSubmit={handleSearchSubmit}
          className="mx-auto mt-6 flex max-w-xl gap-1 rounded-xl border border-line bg-white p-1.5"
        >
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Manzil kiriting, masalan: 3 kichik daha"
            className="flex-1 rounded-lg px-3 py-2 text-sm text-ink outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-ink-700 px-5 py-2 text-sm font-medium text-paper-100 hover:bg-ink-900"
          >
            Qidirish
          </button>
        </form>
      </div>

      {/* Filter chip'lar */}
      <div className="flex flex-wrap justify-center gap-2 px-6 pb-8">
        <button
          onClick={() => toggleRenovation("yevro")}
          className={`${chipBase} ${renovationType === "yevro" ? chipActive : chipInactive}`}
        >
          Yevro remont
        </button>
        <button
          onClick={() => toggleRenovation("oddiy")}
          className={`${chipBase} ${renovationType === "oddiy" ? chipActive : chipInactive}`}
        >
          Oddiy remont
        </button>
        <button
          onClick={() => setAllUtilities((v) => !v)}
          className={`${chipBase} ${allUtilities ? chipActive : chipInactive}`}
        >
          Barcha sharoit bor
        </button>
        <button
          onClick={() => setHasFurniture((v) => !v)}
          className={`${chipBase} ${hasFurniture ? chipActive : chipInactive}`}
        >
          Texnika-jihoz bor
        </button>
        {ROOM_OPTIONS.map((count) => (
          <button
            key={count}
            onClick={() => toggleRoomCount(count)}
            className={`${chipBase} ${roomCount === count ? chipActive : chipInactive}`}
          >
            {count} hona
          </button>
        ))}
      </div>

      {/* Natijalar */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        {loading && <p className="text-center text-muted">Yuklanmoqda...</p>}
        {error && <p className="text-center text-red-700">{error}</p>}

        {!loading && !error && listings.length === 0 && (
          <p className="text-center text-muted">
            Hech qanday e'lon topilmadi. Filterlarni o'zgartirib ko'ring.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {!loading && page < totalPages && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-lg border border-ink-700 px-6 py-2 text-sm font-medium text-ink-700 hover:bg-ink-700 hover:text-paper-100 disabled:opacity-60"
            >
              {loadingMore ? "Yuklanmoqda..." : "Yana yuklash"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }) {
  const conditionText = [
    listing.renovationType === "yevro" ? "Yevro" : "Oddiy",
    `${listing.roomCount} hona`,
    listing.hasGas && listing.hasWater && listing.hasElectricity
      ? "Barcha sharoit"
      : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="h-32 bg-gradient-to-br from-ink-500 to-ink-900">
        {listing.images?.[0] && (
          <img
            src={getImageUrl(listing.images[0])}
            alt={listing.address}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-ink">{listing.address}</p>
        <p className="mb-2 text-xs text-muted-2">{conditionText}</p>
        <p className="text-sm font-medium text-ink-700">
          {Number(listing.price).toLocaleString("uz-UZ")} so'm/oy
        </p>
      </div>
    </Link>
  );
}