import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const TYPE_LABELS = {
  report_received: { icon: "⚠️", classes: "border-red-200 bg-red-50" },
  comment_received: { icon: "💬", classes: "border-line bg-white" },
  contract_created: { icon: "📄", classes: "border-line bg-white" },
  listing_rented: { icon: "🔑", classes: "border-line bg-white" },
  listing_expired: { icon: "⏱️", classes: "border-line bg-white" },
};

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/notifications/mine")
      .then((res) => setNotifications(res.data.notifications))
      .catch(() => setError("Bildirishnomalarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDismiss(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      // xato bo'lsa ham UI'da qaytarib qo'ymaymiz — keyingi yuklashda tiklanadi
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display mb-6 text-2xl font-medium text-ink-900">
        Bildirishnomalar
      </h1>

      {loading && <p className="text-center text-muted">Yuklanmoqda...</p>}
      {error && <p className="text-center text-red-700">{error}</p>}

      {!loading && notifications.length === 0 && (
        <div className="rounded-xl border border-line bg-white py-16 text-center">
          <p className="text-muted">Hali bildirishnoma yo'q</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const meta = TYPE_LABELS[n.type] || { icon: "🔔", classes: "border-line bg-white" };
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border p-3 ${meta.classes}`}
            >
              <span className="text-lg">{meta.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-ink">{n.message}</p>
                <p className="mt-0.5 text-xs text-muted-2">
                  {new Date(n.createdAt).toLocaleString("uz-UZ")}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(n.id)}
                aria-label="Yopish"
                className="text-muted-2 hover:text-ink"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}