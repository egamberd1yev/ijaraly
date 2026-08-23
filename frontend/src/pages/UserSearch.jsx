import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get("/users/search", { params: { q: query.trim() } });
      setResults(res.data.users);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-medium text-ink-900">
        Foydalanuvchilarni qidirish
      </h1>

      {/* Bu bo'lim o'z alohida qoidalariga ega — foydalanuvchiga har safar eslatiladi */}
      <div className="mt-3 rounded-lg border border-gold-500/40 bg-gold-100 px-3 py-2.5 text-xs text-gold-600">
        Diqqat: bu bo'lim asosiy foydalanish shartlaridan tashqari, o'zining
        qo'shimcha qoidalariga ega. Ro'yxatdan o'tish orqali siz shu
        qoidalarga ham rozilik bildirgansiz va ularni buzish mumkin emas.
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ism va familiyasini kiriting"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
        />
        <button
          type="submit"
          className="rounded-lg bg-ink-700 px-5 py-2.5 text-sm font-medium text-paper-100 hover:bg-ink-900"
        >
          Qidirish
        </button>
      </form>

      {loading && <p className="mt-6 text-center text-muted">Qidirilmoqda...</p>}

      {!loading && searched && results.length === 0 && (
        <p className="mt-6 text-center text-muted">Hech kim topilmadi</p>
      )}

      <div className="mt-4 space-y-2">
        {results.map((u) => (
          <Link
            key={u.id}
            to={`/users/${u.id}`}
            className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:border-ink-700/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-xs font-medium text-[#4A2E06]">
              {u.fullName?.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-sm font-medium text-ink">{u.fullName}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}