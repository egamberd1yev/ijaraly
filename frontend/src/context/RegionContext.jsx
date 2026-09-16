import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const RegionContext = createContext(null);

const STORAGE_KEY = "selectedRegion";

export function RegionProvider({ children }) {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lokalki saqlangan regionni o'qish
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // regionId ni saqlaymiz, name ni ham kirishni o'zgartirish uchun
      setSelectedRegion(saved);
    }
  }, []);

  // Viloyatlar ro'yxatini yuklash
  useEffect(() => {
    api
      .get("/regions")
      .then((res) => {
        setRegions(res.data.regions);
        // Agar saqlangan region mavjud bo'lsa, u yangi ro'yxatda bo'lishi shart
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && !res.data.regions.some((r) => r.id === saved)) {
          setSelectedRegion(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectRegion = useCallback(
    (regionId) => {
      setSelectedRegion(regionId);
      localStorage.setItem(STORAGE_KEY, regionId || "");
    },
    []
  );

  const clearRegion = useCallback(() => {
    setSelectedRegion(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    regions,
    selectedRegion,
    selectRegion,
    clearRegion,
    loading,
    getRegionName: (id) => regions.find((r) => r.id === id)?.name || null,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}
