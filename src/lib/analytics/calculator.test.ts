import { describe, it, expect } from "vitest";
import {
  calculate7DayTrend,
  calculateCategoryMetrics,
  calculateActivityHeatmap,
  calculateHistoricalSummary,
} from "./calculator";
import { Task, FocusSession } from "@/types";

describe("Analytics Calculator Engine", () => {
  const sampleTasks: Task[] = [
    {
      id: "1",
      user_id: "user-1",
      title: "Task 1",
      category: "DSA",
      priority: "high",
      status: "completed",
      due_date: "2026-10-19",
      estimated_duration_minutes: 60,
      tags: [],
      created_at: "2026-10-19T00:00:00Z",
      updated_at: "2026-10-19T00:00:00Z",
    },
    {
      id: "2",
      user_id: "user-1",
      title: "Task 2",
      category: "DSA",
      priority: "medium",
      status: "completed",
      due_date: "2026-10-19",
      estimated_duration_minutes: 30,
      tags: [],
      created_at: "2026-10-19T00:00:00Z",
      updated_at: "2026-10-19T00:00:00Z",
    },
    {
      id: "3",
      user_id: "user-1",
      title: "Task 3",
      category: "Java",
      priority: "urgent",
      status: "pending",
      due_date: "2026-10-19",
      estimated_duration_minutes: 45,
      tags: [],
      created_at: "2026-10-19T00:00:00Z",
      updated_at: "2026-10-19T00:00:00Z",
    },
  ];

  const sampleSessions: FocusSession[] = [
    {
      id: "f1",
      user_id: "user-1",
      started_at: "2026-10-19T09:00:00Z",
      duration_minutes: 50,
      status: "completed",
      created_at: "2026-10-19T09:50:00Z",
    },
  ];

  it("calculates 7-day trend with exactly 7 data points", () => {
    const trend = calculate7DayTrend(sampleTasks, "2026-10-19");
    expect(trend).toHaveLength(7);
    const todayPoint = trend[trend.length - 1];
    expect(todayPoint.date).toBe("2026-10-19");
    expect(todayPoint.total).toBe(3);
    expect(todayPoint.completed).toBe(2);
    expect(todayPoint.percentage).toBe(67);
  });

  it("calculates category breakdown accurately", () => {
    const catStats = calculateCategoryMetrics(sampleTasks);
    const dsa = catStats.find((c) => c.category === "DSA");
    expect(dsa?.total).toBe(2);
    expect(dsa?.completed).toBe(2);
    expect(dsa?.percentage).toBe(100);

    const java = catStats.find((c) => c.category === "Java");
    expect(java?.total).toBe(1);
    expect(java?.completed).toBe(0);
    expect(java?.percentage).toBe(0);
  });

  it("calculates historical summary and excludes empty days from average", () => {
    const summary = calculateHistoricalSummary(sampleTasks, sampleSessions, "2026-10-19");
    expect(summary.totalCompletedAllTime).toBe(2);
    expect(summary.totalFocusMinutes).toBe(50);
    expect(summary.mostProductiveCategory).toBe("DSA");
    expect(summary.averageCompletionRate).toBe(67);
  });
});
