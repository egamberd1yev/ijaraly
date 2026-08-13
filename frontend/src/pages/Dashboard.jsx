import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { getImageUrl } from "../api/getImageUrl";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";

const STATUS_LABELS = {
  active: { text: "Faol", classes: "bg-ink-700/10 text-ink-700" },
  rented: { text: "Ijaraga berilgan", classes: "bg-gold-500/15 text-gold-600" },
  inactive: { text: "Nofaol", classes: "bg-line/60 text-muted" },
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // O'chirish uchun tanlangan e'lon id'si — modalni ko'rsatish/berkitishni boshqaradi
  const [deleteTarget, setDeleteTarget] = useState(null);

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
          return (
            <div
              key={listing.id}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              <Link to={`/listings/${listing.id}`}>
                <div className="h-32 bg-gradient-to-br from-ink-500 to-ink-900">
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
                <p className="mb-2 text-xs text-muted-2">
                  {listing.renovationType === "yevro" ? "Yevro" : "Oddiy"} •{" "}
                  {listing.roomCount} hona
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-700">
                    {Number(listing.price).toLocaleString("uz-UZ")} so'm/oy
                  </p>
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