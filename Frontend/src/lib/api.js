export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const resolveFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
};
