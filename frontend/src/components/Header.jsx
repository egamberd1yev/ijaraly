import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import logoIcon from "../assets/ijaraly-icon.png";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    setMobileOpen(false);
    navigate("/");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header className="bg-ink-900 px-4 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={closeMobile}>
          <img src={logoIcon} alt="Ijaraly" className="h-7 w-auto sm:h-8" />
          <span className="font-display text-lg font-medium text-paper-100 tracking-wide sm:text-xl">
            Ijaraly
          </span>
        </Link>

        {/* Desktop navigatsiya — md va undan katta ekranlarda ko'rinadi */}
        <nav className="hidden items-center gap-5 md:flex">
          {user ? (
            <>
              <Link to="/listings/new" className="text-sm text-[#CFE3DD] hover:text-paper-100">
                E'lon joylash
              </Link>
              <Link to="/dashboard" className="text-sm text-[#CFE3DD] hover:text-paper-100">
                Mening e'lonlarim
              </Link>
              <Link to="/contracts" className="text-sm text-[#CFE3DD] hover:text-paper-100">
                Shartnomalarim
              </Link>
              <Link to="/users/search" title="Foydalanuvchilarni qidirish" className="text-[#CFE3DD] hover:text-paper-100">
                <SearchIcon />
              </Link>
              <Link to="/notifications" title="Bildirishnomalar" className="relative text-[#CFE3DD] hover:text-paper-100">
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
              <button onClick={handleLogout} className="text-sm text-[#CFE3DD] hover:text-paper-100">
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[#CFE3DD] hover:text-paper-100">
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

        {/* Mobil/planshet: qo'ng'iroq (agar login bo'lsa) + hamburger tugmasi */}
        <div className="flex items-center gap-3 md:hidden">
          {user && (
            <Link to="/notifications" title="Bildirishnomalar" className="relative text-[#CFE3DD]">
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-medium text-[#4A2E06]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menyu"
            className="text-[#CFE3DD]"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobil ochiladigan menyu */}
      {mobileOpen && (
        <nav className="mx-auto mt-3 flex max-w-6xl flex-col gap-1 border-t border-white/10 pt-3 md:hidden">
          {user ? (
            <>
              <MobileLink to="/listings/new" onClick={closeMobile}>
                E'lon joylash
              </MobileLink>
              <MobileLink to="/dashboard" onClick={closeMobile}>
                Mening e'lonlarim
              </MobileLink>
              <MobileLink to="/contracts" onClick={closeMobile}>
                Shartnomalarim
              </MobileLink>
              <MobileLink to="/users/search" onClick={closeMobile}>
                Foydalanuvchilarni qidirish
              </MobileLink>
              <MobileLink to="/profile" onClick={closeMobile}>
                Profil ({user.fullName})
              </MobileLink>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2.5 text-left text-sm text-[#CFE3DD] hover:bg-white/5"
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <MobileLink to="/login" onClick={closeMobile}>
                Kirish
              </MobileLink>
              <MobileLink to="/signup" onClick={closeMobile}>
                Ro'yxatdan o'tish
              </MobileLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 text-sm text-[#CFE3DD] hover:bg-white/5"
    >
      {children}
    </Link>
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
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}