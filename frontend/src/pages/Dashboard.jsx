import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { getImageUrl } from "../api/getImageUrl";
import { formatPrice } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";

const STATUS_LABELS = {
  active: { text: "Faol", classes: "bg-ink-700/10 text-ink-700" },
  rented: { text: "Ijaraga berilgan", classes: "bg-gold-500/15 text-gold-600" },
  inactive: { text: "Muddati tugagan", classes: "bg-line/60 text-muted" },
};

const LISTING_LIFETIME_DAYS = 7;

// "active" e'lon uchun avtomatik yopilishiga necha kun qolganini hisoblaydi
function daysUntilExpiry(createdAt) {
  const created = new Date(createdAt);
  const expiresAt = new Date(created);
  expiresAt.setDate(expiresAt.getDate() + LISTING_LIFETIME_DAYS);
  const diffMs = expiresAt - new Date();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // O'chirish uchun tanlangan e'lon id'si — modalni ko'rsatish/berkitishni boshqaradi
  const [deleteTarget, setDeleteTarget] = useState(null);
  // "Ijaraga berildi" bosilganda tugma vaqtincha o'chirib turiladi
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/listings/mine")
      .then((res) => setListings(res.data.listings))
      .catch(() => setError("E'lonlarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [user]);

  async function confirmDelete() {
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`/listings/${id}`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("E'lonni o'chirishda xatolik yuz berdi");
    }
  }

  async function handleMarkAsRented(id) {
    setUpdatingId(id);
    try {
      const res = await api.put(`/listings/${id}`, { status: "rented" });
      setListings((prev) =>
        prev.map((l) => (l.id === id ? res.data.listing : l))
      );
    } catch {
      alert("Holatni yangilashda xatolik yuz berdi");
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink-900">
          Mening e'lonlarim
        </h1>
        <Link
          to="/listings/new"
          className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-[#4A2E06] hover:bg-gold-600"
        >
          + Yangi e'lon
        </Link>
      </div>

      {loading && <p className="text-center text-muted">Yuklanmoqda...</p>}
      {error && <p className="text-center text-red-700">{error}</p>}

      {!loading && listings.length === 0 && (
        <div className="rounded-xl border border-line bg-white py-16 text-center">
          <p className="text-muted">Sizda hali e'lon yo'q</p>
          <Link
            to="/listings/new"
            className="mt-3 inline-block text-sm font-medium text-ink-700 hover:underline"
          >
            Birinchi e'loningizni joylang
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => {
          const status = STATUS_LABELS[listing.status] || STATUS_LABELS.active;
          const daysLeft =
            listing.status === "active" ? daysUntilExpiry(listing.createdAt) : null;

          return (
            <div
              key={listing.id}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              <Link to={`/listings/${listing.id}`}>
                <div className="h-32 bg-linear-to-br from-ink-500 to-ink-900">
                  {listing.images?.[0] && (
                    <img
                      src={getImageUrl(listing.images[0])}
                      alt={listing.address}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </Link>
              <div className="p-3">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{listing.address}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${status.classes}`}
                  >
                    {status.text}
                  </span>
                </div>
                <p className="mb-1 text-xs text-muted-2">
                  {listing.renovationType === "yevro" ? "Yevro" : "Oddiy"} •{" "}
                  {listing.roomCount} hona
                </p>
                {daysLeft !== null && (
                  <p className="mb-2 text-xs text-muted-2">
                    {daysLeft > 0
                      ? `${daysLeft} kundan so'ng avtomatik yopiladi`
                      : "Bugun avtomatik yopiladi"}
                  </p>
                )}
                <p className="mb-2 text-sm font-medium text-ink-700">
                  {formatPrice(listing.price, listing.currency)}
                </p>

                <div className="flex items-center justify-between gap-2">
                  {listing.status === "active" ? (
                    <button
                      onClick={() => handleMarkAsRented(listing.id)}
                      disabled={updatingId === listing.id}
                      className="rounded-lg bg-ink-700 px-3 py-1.5 text-xs font-medium text-paper-100 hover:bg-ink-900 disabled:opacity-60"
                    >
                      {updatingId === listing.id ? "..." : "Ijaraga berildi"}
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => setDeleteTarget(listing.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="E'lonni o'chirish"
        description="Rostdan ham bu e'lonni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}