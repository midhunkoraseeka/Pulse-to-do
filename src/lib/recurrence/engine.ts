import { RecurrenceRule, TaskOccurrence } from "@/types";

/**
 * Checks if a given recurrence rule should generate an occurrence on a specific date string (YYYY-MM-DD).
 */
export function isRuleActiveOnDate(rule: RecurrenceRule, dateStr: string): boolean {
  if (!rule.active) return false;
  if (dateStr < rule.start_date) return false;
  if (rule.end_date && dateStr > rule.end_date) return false;

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  switch (rule.frequency) {
    case "daily":
      return true;
    case "weekdays":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "weekly":
      if (rule.days_of_week && rule.days_of_week.length > 0) {
        return rule.days_of_week.includes(dayOfWeek);
      }
      // If no specific days provided, match the day of start_date
      const [sYear, sMonth, sDay] = rule.start_date.split("-").map(Number);
      const startDay = new Date(Date.UTC(sYear, sMonth - 1, sDay)).getUTCDay();
      return dayOfWeek === startDay;
    case "custom_days":
      return Boolean(rule.days_of_week && rule.days_of_week.includes(dayOfWeek));
    default:
      return false;
  }
}

/**
 * Generates an occurrence object idempotently for a rule on target date.
 * If an existing occurrence already exists in the provided list, returns the existing one (preserving completion status).
 */
export function getOrCreateOccurrence(
  rule: RecurrenceRule,
  dateStr: string,
  existingOccurrences: TaskOccurrence[]
): TaskOccurrence | null {
  if (!isRuleActiveOnDate(rule, dateStr)) {
    return null;
  }

  const existing = existingOccurrences.find(
    (occ) => occ.recurrence_rule_id === rule.id && occ.scheduled_date === dateStr
  );

  if (existing) {
    return existing;
  }

  return {
    id: `occ_${rule.id}_${dateStr}`,
    recurrence_rule_id: rule.id,
    user_id: rule.user_id,
    scheduled_date: dateStr,
    status: "pending",
    completed_at: null,
    created_at: new Date().toISOString(),
  };
}

/**
 * Generates all occurrences for a rule across a range of dates [startDateStr, endDateStr].
 */
export function generateOccurrencesForRange(
  rule: RecurrenceRule,
  startDateStr: string,
  endDateStr: string,
  existingOccurrences: TaskOccurrence[]
): TaskOccurrence[] {
  const result: TaskOccurrence[] = [];
  const current = new Date(`${startDateStr}T00:00:00Z`);
  const end = new Date(`${endDateStr}T00:00:00Z`);

  while (current <= end) {
    const isoDate = current.toISOString().slice(0, 10);
    const occ = getOrCreateOccurrence(rule, isoDate, existingOccurrences);
    if (occ) {
      result.push(occ);
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
}
