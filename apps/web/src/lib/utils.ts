import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_URL } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getLocalizedField(obj: any, field: string, language: 'en' | 'bn') {
  if (!obj) return '';
  if (language === 'bn') {
    return obj[`${field}_bn`] || obj[field] || '';
  }
  return obj[field] || '';
}

export function getImageUrl(url: any) {
  if (!url || typeof url !== "string") {
    return "https://picsum.photos/seed/default/800/800";
  }

  // Already absolute → return as-is
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // 🔥 Normalize broken / polluted paths
  let cleanUrl = url
      .replace(/^\.?prithibee\.com/, "")
      .replace(/^api\.prithibee\.com/, "")
      .replace(/^\/+/, "");

  // Ensure uploads path exists
  if (!cleanUrl.startsWith("api/uploads")) {
    cleanUrl = `api/uploads/${cleanUrl.replace(/^uploads\//, "")}`;
  }

  // Base host (no /api)
  const baseUrl = API_URL;

  return `${baseUrl}/${cleanUrl}`;
}
