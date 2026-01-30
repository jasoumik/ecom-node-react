import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_URL, UPLOADS_HOST } from "./config";

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
  if (!url || typeof url !== 'string') return "https://picsum.photos/seed/default/800/800";
  
  if (url.startsWith("http") || url.startsWith("https")) {
    return url;
  }

  // Use explicit uploads host if available
  if (UPLOADS_HOST) {
      const host = UPLOADS_HOST.startsWith('http') ? UPLOADS_HOST : `https://${UPLOADS_HOST}`;
      const cleanPath = url.startsWith("/") ? url : `/${url}`;
      return `${host}${cleanPath}`;
  }
  
  // Use API_URL directly
  let baseUrl = API_URL;
  
  // Only apply localhost fix if we are actually on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      if (baseUrl.includes('localhost:3000') || baseUrl.includes('127.0.0.1:3000')) {
          baseUrl = baseUrl.replace('3000', '3001');
      }
  }

  // Fix malformed domain if present
  baseUrl = baseUrl.replace('https:/.', 'https://');

  // Ensure protocol
  if (!baseUrl.startsWith('http') && !baseUrl.startsWith('/')) {
      baseUrl = `https://${baseUrl}`;
  }
  
  // If URL already starts with /api/uploads and baseUrl ends with /api, remove one /api
  // This handles the case where DB has /api/uploads/... and API_URL has /api
  if (url.startsWith('/api/uploads') && baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4); // Remove last /api
  }
  
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  
  return `${baseUrl}${cleanPath}`;
}
