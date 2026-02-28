/**
 * Time formatting utilities for consistent 12-hour time display.
 *
 * Database stores time in 24-hour format (e.g., "14:30")
 * UI displays time in 12-hour format (e.g., "2:30 PM")
 */

/**
 * Convert 24-hour time string to 12-hour format with AM/PM
 * @param time24 - Time in "HH:MM" format (e.g., "14:30")
 * @returns Time in "h:mm AM/PM" format (e.g., "2:30 PM")
 */
export function formatTime12h(time24: string): string {
  if (!time24) return "";

  const [hoursStr, minutesStr] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format a time range in 12-hour format
 * @param startTime - Start time in "HH:MM" format
 * @param endTime - End time in "HH:MM" format
 * @returns Formatted range (e.g., "2:30 PM - 3:30 PM")
 */
export function formatTimeRange12h(startTime: string, endTime: string): string {
  return `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;
}

/**
 * Convert 12-hour time string to 24-hour format
 * @param time12h - Time in "h:mm AM/PM" format (e.g., "2:30 PM")
 * @returns Time in "HH:MM" format (e.g., "14:30")
 */
export function convertTo24Hour(time12h: string): string {
  if (!time12h || time12h === "Closed") return "";

  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return "";

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

/**
 * Parse a time string (HH:MM) into total minutes from midnight
 * @param time - Time in "HH:MM" format
 * @returns Total minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to time string (HH:MM)
 * @param totalMinutes - Total minutes from midnight
 * @returns Time in "HH:MM" format
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Get current time in HH:MM format
 * @returns Current time in "HH:MM" format
 */
export function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * Check if two time ranges overlap
 * @param start1 - Start time of first range (HH:MM)
 * @param end1 - End time of first range (HH:MM)
 * @param start2 - Start time of second range (HH:MM)
 * @param end2 - End time of second range (HH:MM)
 * @returns true if ranges overlap
 */
export function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
}

/**
 * Check if a given date is today
 * @param date - Date to check
 * @returns true if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
