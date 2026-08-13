import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/signup", form);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        "Xatolik yuz berdi, qayta urinib ko'ring";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-center text-2xl font-medium text-ink-900">
        Ro'yxatdan o'tish
      </h1>
      <p className="mt-1 text-center text-sm text-muted">
        Bitta hisob bilan ham ijaraga beruvchi, ham qidiruvchi bo'ling
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink">To'liq ism</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            placeholder="Aziz Aripov"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="email@misol.com"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink">
            Telefon <span className="text-muted-2">(ixtiyoriy)</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+998901234567"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink">Parol</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="Kamida 6 ta belgi"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold-500 py-2.5 text-sm font-medium text-[#4A2E06] hover:bg-gold-600 disabled:opacity-60"
        >
          {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Hisobingiz bormi?{" "}
        <Link to="/login" className="font-medium text-ink-700 hover:underline">
          Kiring
        </Link>
      </p>
    </div>
  );
}