import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountMinor: number, currency = 'NGN'): string {
  return (amountMinor / 100).toFixed(2);
}

export function formatAmount(amountMinor: number, currency = 'NGN'): string {
  const symbol = currency === 'NGN' ? '₦' : currency;
  return `${symbol} ${formatCurrency(amountMinor, currency)}`;
}
