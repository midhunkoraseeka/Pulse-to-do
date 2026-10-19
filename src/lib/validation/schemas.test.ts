import { describe, it, expect } from "vitest";
import {
  TaskInputSchema,
  GoalInputSchema,
  AIDayPlanResponseSchema,
  AIProductivityInsightResponseSchema,
  AIGoalBreakdownResponseSchema,
} from "./schemas";

describe("Validation Schemas", () => {
  it("validates valid task input", () => {
    const valid = {
      title: "Complete Operating Systems Lab",
      category: "College",
      priority: "high",
      due_date: "2026-10-20",
      estimated_duration_minutes: 90,
      tags: ["os", "lab"],
    };
    const parsed = TaskInputSchema.parse(valid);
    expect(parsed.title).toBe("Complete Operating Systems Lab");
    expect(parsed.estimated_duration_minutes).toBe(90);
    expect(parsed.status).toBe("pending"); // default
  });

  it("rejects task input with invalid date format", () => {
    const invalid = {
      title: "Test Task",
      category: "DSA",
      due_date: "20-10-2026", // should be YYYY-MM-DD
    };
    expect(() => TaskInputSchema.parse(invalid)).toThrow();
  });

  it("validates valid AI Day Plan response", () => {
    const validPlan = {
      headline: "Balanced Engineering Pipeline",
      summary: "Prioritizes algorithms in the morning.",
      schedule: [
        {
          task_id: "t1",
          task_title: "LeetCode Graphs",
          suggested_start_time: "09:00",
          suggested_end_time: "10:00",
          priority_explanation: "High cognitive priority",
          rationale: "Morning mental sharpness",
        },
      ],
      tips_for_momentum: ["Hydrate", "Take 5m breaks"],
    };
    const parsed = AIDayPlanResponseSchema.parse(validPlan);
    expect(parsed.schedule).toHaveLength(1);
    expect(parsed.schedule[0].task_id).toBe("t1");
  });

  it("validates valid Goal Breakdown response", () => {
    const validBreakdown = {
      goal_title: "Master Java Concurrency",
      strategy_summary: "Progressive lock and condition variable mastery",
      tasks: [
        {
          title: "Implement Bounded Buffer with ReentrantLock",
          category: "Java",
          priority: "high",
          estimated_duration_minutes: 60,
          target_day_offset: 1,
          rationale: "Core interview pattern",
        },
      ],
      estimated_total_hours: 1,
    };
    const parsed = AIGoalBreakdownResponseSchema.parse(validBreakdown);
    expect(parsed.tasks).toHaveLength(1);
  });
});
