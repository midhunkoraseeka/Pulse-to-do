import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";

/**
 * Returns current date in YYYY-MM-DD for a specified timezone or local system.
 */
export function getTodayDateString(timeZone?: string): string {
  try {
    if (timeZone) {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(new Date());
    }
  } catch {
    // fallback to local
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date nicely with relative context where possible.
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEE, MMM d");
  } catch {
    return dateStr;
  }
}

/**
 * Formats an ISO timestamp or date to full editorial date, e.g. "Monday, 19 October 2026"
 */
export function formatEditorialDate(date: Date = new Date()): string {
  return format(date, "EEEE, d MMMM yyyy");
}

/**
 * Formats time string e.g. "14:30" to "2:30 PM"
 */
export function formatFriendlyTime(timeStr?: string | null): string {
  if (!timeStr) return "";
  try {
    const [hrs, mins] = timeStr.split(":").map(Number);
    const period = hrs >= 12 ? "PM" : "AM";
    const displayHrs = hrs % 12 || 12;
    return `${displayHrs}:${String(mins).padStart(2, "0")} ${period}`;
  } catch {
    return timeStr;
  }
}
