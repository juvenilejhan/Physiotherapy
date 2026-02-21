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

/**
 * Normalize Bangladeshi phone number for database storage
 * Converts various formats to: +8801XXXXXXXXX
 * @param phone - Phone number in any common format
 * @returns Normalized phone string or null if invalid
 */
export function normalizeBDPhone(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except leading +
  let digits = phone.replace(/[^\d+]/g, "");

  // Remove leading + for processing
  if (digits.startsWith("+")) {
    digits = digits.substring(1);
  }

  // Handle different input formats:
  // +8801XXXXXXXXX -> 8801XXXXXXXXX
  // 8801XXXXXXXXX  -> 8801XXXXXXXXX
  // 01XXXXXXXXX    -> 1XXXXXXXXX

  if (digits.startsWith("880")) {
    // Already has country code: 8801XXXXXXXXX
    digits = digits.substring(3);
  } else if (digits.startsWith("0")) {
    // Local format: 01XXXXXXXXX
    digits = digits.substring(1);
  }

  // Now digits should be: 1XXXXXXXXX (10 digits starting with 1)

  // Validate: must be 10 digits and start with valid operator code (13-19)
  if (digits.length !== 10 || !digits.startsWith("1")) {
    // Return original if can't normalize (might be landline or foreign)
    return phone;
  }

  // Check for valid Bangladeshi mobile operator prefix (13-19)
  const operatorCode = digits.substring(1, 2);
  const validOperators = ["3", "4", "5", "6", "7", "8", "9"];

  if (!validOperators.includes(operatorCode)) {
    return phone;
  }

  // Return normalized format: +8801XXXXXXXXX
  return `+880${digits}`;
}

/**
 * Validate Bangladeshi phone number format
 * @param phone - Phone number to validate
 * @returns true if valid BD mobile number
 */
export function isValidBDPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const normalized = normalizeBDPhone(phone);
  return (
    normalized !== null &&
    normalized.startsWith("+880") &&
    normalized.length === 14
  );
}

/**
 * Generate WhatsApp click-to-chat link
 * @param phone - Phone number (will be normalized)
 * @param message - Optional pre-filled message
 * @returns WhatsApp URL or null if invalid phone
 */
export function getWhatsAppLink(
  phone: string | null | undefined,
  message?: string,
): string | null {
  if (!phone) return null;

  const normalized = normalizeBDPhone(phone);
  if (!normalized) return null;

  // Remove + sign for WhatsApp API
  const phoneNumber = normalized.replace("+", "");

  let url = `https://wa.me/${phoneNumber}`;
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }

  return url;
}
