import { describe, it, expect } from "vitest";
import { isRuleActiveOnDate, getOrCreateOccurrence, generateOccurrencesForRange } from "./engine";
import { RecurrenceRule, TaskOccurrence } from "@/types";

describe("Recurrence Engine", () => {
  const dailyRule: RecurrenceRule = {
    id: "rule-daily",
    user_id: "user-1",
    frequency: "daily",
    start_date: "2026-10-01",
    active: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  };

  const weekdaysRule: RecurrenceRule = {
    id: "rule-weekdays",
    user_id: "user-1",
    frequency: "weekdays",
    start_date: "2026-10-01",
    active: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  };

  it("checks daily rule activity correctly", () => {
    expect(isRuleActiveOnDate(dailyRule, "2026-10-15")).toBe(true);
    // Before start_date
    expect(isRuleActiveOnDate(dailyRule, "2026-09-30")).toBe(false);
  });

  it("checks weekdays rule (excludes weekends)", () => {
    // 2026-10-18 was Sunday, 2026-10-19 is Monday
    expect(isRuleActiveOnDate(weekdaysRule, "2026-10-18")).toBe(false);
    expect(isRuleActiveOnDate(weekdaysRule, "2026-10-19")).toBe(true);
  });

  it("preserves historical completion in getOrCreateOccurrence", () => {
    const existing: TaskOccurrence = {
      id: "occ_rule-daily_2026-10-19",
      recurrence_rule_id: "rule-daily",
      user_id: "user-1",
      scheduled_date: "2026-10-19",
      status: "completed",
      completed_at: "2026-10-19T08:30:00Z",
      created_at: "2026-10-19T00:00:00Z",
    };

    const result = getOrCreateOccurrence(dailyRule, "2026-10-19", [existing]);
    expect(result).not.toBeNull();
    expect(result?.status).toBe("completed");
    expect(result?.completed_at).toBe("2026-10-19T08:30:00Z");
  });

  it("generates new pending occurrence when none exists", () => {
    const result = getOrCreateOccurrence(dailyRule, "2026-10-20", []);
    expect(result).not.toBeNull();
    expect(result?.status).toBe("pending");
    expect(result?.scheduled_date).toBe("2026-10-20");
  });
});
