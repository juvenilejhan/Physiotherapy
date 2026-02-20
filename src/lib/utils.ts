import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Bangladeshi Taka (BDT) currency
 * Uses Bangladeshi/Indian numbering system (lakhs and crores)
 * @param amount - The amount to format
 * @returns Formatted string with ৳ symbol
 */
export function formatBDT(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "৳0";

  // Format using Bangladeshi locale (en-BD) for proper grouping
  // This uses the lakh/crore system: 1,00,000 instead of 100,000
  return "৳" + num.toLocaleString("en-IN");
}

/**
 * Format phone number in Bangladeshi format
 * @param phone - Phone number string
 * @returns Formatted phone with +880 prefix displayed
 */
export function formatBDPhone(phone: string): string {
  // Remove any non-digit characters
  let digits = phone.replace(/\D/g, "");

  // Handle different formats
  if (digits.startsWith("880")) {
    digits = digits.substring(3);
  } else if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  // Format as +880 XXXX-XXXXXX
  if (digits.length === 10) {
    return `+880 ${digits.substring(0, 4)}-${digits.substring(4)}`;
  }

  return `+880 ${digits}`;
}
