const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
 
export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}${path}`;
}