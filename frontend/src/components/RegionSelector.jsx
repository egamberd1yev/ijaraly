import { useState } from "react";
import { useRegion } from "../context/RegionContext";
import { Link } from "react-router-dom";

export default function RegionSelector() {
  const { regions, selectedRegion, selectRegion } = useRegion();
  const [open, setOpen] = useState(false);

  function handleSelect(regionId) {
    selectRegion(regionId === selectedRegion ? null : regionId);
    setOpen(false);
  }

  function getDisplayLabel(id) {
    if (!id) return "Viloyat tanlash";
    return regions.find((r) => r.id === id)?.name || "Viloyat tanlash";
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-[#CFE3DD] hover:bg-white/5 transition-colors"
        aria-label="Viloyatni tanlash"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className="text-[#CFE3DD]"
        >
          <path
            d="M12 21s-7-4.5-7-11a7 7 0 0114 0c0 6.5-7 11-7 11z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="truncate max-w-140px">{getDisplayLabel(selectedRegion)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className={`text-[#CFE3DD] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-white/10 bg-ink-900 py-1.5 shadow-xl">
            <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase text-muted tracking-wide">
              Viloyatni tanlang
            </div>
            {regions.map((region) => (
              <Link
                key={region.id}
                to={`/regions/${region.id}`}
                onClick={() => {
                  selectRegion(region.id);
                  setOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                  selectedRegion === region.id
                    ? "bg-gold-500/20 text-gold-400"
                    : "text-[#CFE3DD] hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{region.name}</span>
                  {selectedRegion === region.id && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="text-[10px] text-muted/60 capitalize">{region.type}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
