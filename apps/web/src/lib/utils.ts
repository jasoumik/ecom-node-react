import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
