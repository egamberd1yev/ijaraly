import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="bg-ink-900 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 26 26">
            <path
              d="M13 2 L24 12 L24 24 L2 24 L2 12 Z"
              fill="none"
              stroke="var(--color-gold-500)"
              strokeWidth="1.6"
            />
            <path
              d="M13 8 C9 8 8 12 8 15 L8 24 L18 24 L18 15 C18 12 17 8 13 8 Z"
              fill="var(--color-gold-500)"
            />
          </svg>
          <span className="font-display text-xl font-medium text-paper-100 tracking-wide">
            Ijaraly
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          {user ? (
            <>
              <Link
                to="/listings/new"
                className="text-sm text-[#CFE3DD] hover:text-paper-100"
              >
                E'lon joylash
              </Link>
              <Link
                to="/dashboard"
                className="text-sm text-[#CFE3DD] hover:text-paper-100"
              >
                Mening e'lonlarim
              </Link>
              <Link to="/profile" title={user.fullName}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-xs font-medium text-[#4A2E06]">
                  {user.fullName?.slice(0, 2).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-[#CFE3DD] hover:text-paper-100"
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-[#CFE3DD] hover:text-paper-100"
              >
                Kirish
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-[#4A2E06] hover:bg-gold-600"
              >
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
