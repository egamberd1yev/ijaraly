import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { getImageUrl } from "../api/getImageUrl";
import { formatPrice } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function Contracts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);
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
      .get("/contracts/mine")
      .then((res) => setContracts(res.data.contracts))
      .catch(() => setError("Shartnomalarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display mb-6 text-2xl font-medium text-ink-900">
        Mening shartnomalarim
      </h1>

      {loading && <p className="text-center text-muted">Yuklanmoqda...</p>}
      {error && <p className="text-center text-red-700">{error}</p>}

      {!loading && contracts.length === 0 && (
        <div className="rounded-xl border border-line bg-white py-16 text-center">
          <p className="text-muted">Hali tuzilgan shartnoma yo'q</p>
        </div>
      )}

      <div className="space-y-3">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="flex items-center justify-between rounded-xl border border-line bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-ink">{contract.address}</p>
              <p className="mt-0.5 text-xs text-muted-2">
                Ijarachi: {contract.renterFullName} •{" "}
                {formatPrice(contract.monthlyPrice, contract.currency)}
              </p>
              <p className="mt-0.5 text-xs text-muted-2">
                {new Date(contract.startDate).toLocaleDateString("uz-UZ")} —{" "}
                {new Date(contract.endDate).toLocaleDateString("uz-UZ")}
              </p>
            </div>
            <a
              href={getImageUrl(contract.pdfUrl)}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-lg bg-ink-700 px-3 py-1.5 text-xs font-medium text-paper-100 hover:bg-ink-900"
            >
              PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}