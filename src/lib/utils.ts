import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₲ ${amount.toLocaleString('es-PY')}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-PY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateQRToken(): string {
  return `qr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateReferralCode(): string {
  return `REF-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function calculateTrustScore(
  ratings: { rating: number }[],
  strikes: { strike_type: string }[]
): number {
  let score = 5.0;
  
  // Rating impact
  ratings.forEach(r => {
    if (r.rating === 5) score += 0.08;
    else if (r.rating === 4) score += 0.04;
    else if (r.rating === 3) score += 0;
    else if (r.rating === 2) score -= 0.12;
    else if (r.rating === 1) score -= 0.20;
  });
  
  // Strike impact
  strikes.forEach(s => {
    if (s.strike_type === 'WARNING') score -= 0.1;
    else if (s.strike_type === 'MODERATE') score -= 0.3;
    else if (s.strike_type === 'SERIOUS') score -= 0.7;
    else if (s.strike_type === 'CRITICAL') score -= 1.5;
  });
  
  return Math.max(0, Math.min(5, score));
}

export const strikePenalties: Record<string, number> = {
  WARNING: -0.1,
  MODERATE: -0.3,
  SERIOUS: -0.7,
  CRITICAL: -1.5,
};

export const ratingBonuses: Record<number, number> = {
  1: -0.20,
  2: -0.12,
  3: 0,
  4: 0.04,
  5: 0.08,
};

