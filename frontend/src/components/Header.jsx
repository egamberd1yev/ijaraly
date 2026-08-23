import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    api
      .get("/notifications/mine")
      .then((res) => {
        const unread = res.data.notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, [user]);

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
              <Link
                to="/contracts"
                className="text-sm text-[#CFE3DD] hover:text-paper-100"
              >
                Shartnomalarim
              </Link>
              <Link
                to="/users/search"
                title="Foydalanuvchilarni qidirish"
                className="text-[#CFE3DD] hover:text-paper-100"
              >
                <SearchIcon />
              </Link>
              <Link
                to="/notifications"
                title="Bildirishnomalar"
                className="relative text-[#CFE3DD] hover:text-paper-100"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-medium text-[#4A2E06]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
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

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}