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

  // Debug Log - Check for this in browser console
  if (typeof window !== 'undefined') {
      console.log('getImageUrl v5 Debug:', { API_URL, UPLOADS_HOST, url });
  }

  // NUCLEAR OPTION: Hardcode production URL if we are on the production domain
  // This runs on both Server (SSR) and Client
  // We check if API_URL looks suspicious (starts with dot) OR if we are just in prod
  if (process.env.NODE_ENV === 'production') {
      // If UPLOADS_HOST is set, use it
      if (UPLOADS_HOST && UPLOADS_HOST.includes('prithibee.com')) {
          const host = UPLOADS_HOST.startsWith('http') ? UPLOADS_HOST : `https://${UPLOADS_HOST}`;
          const cleanPath = url.startsWith("/") ? url : `/${url}`;
          return `${host}${cleanPath}`;
      }
      
      // Fallback to hardcoded main domain if API_URL is broken
      if (API_URL.startsWith('.') || API_URL.includes('.prithibee.com')) {
           const cleanPath = url.startsWith("/") ? url : `/${url}`;
           // Assuming API is at api.prithibee.com based on your env file
           return `https://api.prithibee.com/api/uploads${cleanPath.replace('/api/uploads', '')}`;
      }
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
  if (baseUrl.startsWith('.')) {
      baseUrl = `https://${baseUrl.substring(1)}`;
  } else {
      baseUrl = baseUrl.replace('https:/.', 'https://');
  }

  // Ensure protocol
  if (!baseUrl.startsWith('http') && !baseUrl.startsWith('/')) {
      baseUrl = `https://${baseUrl}`;
  }
  
  // If URL already starts with /api/uploads and baseUrl ends with /api, remove one /api
  if (url.startsWith('/api/uploads') && baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4);
  }
  
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  
  return `${baseUrl}${cleanPath}`;
}
