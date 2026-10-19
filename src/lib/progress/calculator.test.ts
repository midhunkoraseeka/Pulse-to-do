import { describe, it, expect } from "vitest";
import { calculateDailyProgress, isTaskEligible, isTaskOverdue } from "./calculator";
import { Task } from "@/types";

describe("Progress Calculator Engine", () => {
  const baseTask: Task = {
    id: "task-1",
    user_id: "user-123",
    title: "Solve Binary Search Tree",
    category: "DSA",
    priority: "high",
    status: "pending",
    due_date: "2026-10-19",
    estimated_duration_minutes: 45,
    tags: ["trees", "leetcode"],
    created_at: "2026-10-19T00:00:00Z",
    updated_at: "2026-10-19T00:00:00Z",
  };

  it("handles zero tasks correctly with NO TASKS PLANNED", () => {
    const result = calculateDailyProgress([], "2026-10-19");
    expect(result.totalTasks).toBe(0);
    expect(result.completedTasks).toBe(0);
    expect(result.progressPercentage).toBe(0);
    expect(result.hasTasks).toBe(false);
    expect(result.statusLabel).toBe("NO TASKS PLANNED");
  });

  it("calculates progress for partially completed tasks", () => {
    const tasks: Task[] = [
      { ...baseTask, id: "1", status: "completed" },
      { ...baseTask, id: "2", status: "pending" },
      { ...baseTask, id: "3", status: "pending" },
      { ...baseTask, id: "4", status: "completed" },
    ];
    const result = calculateDailyProgress(tasks, "2026-10-19");
    expect(result.totalTasks).toBe(4);
    expect(result.completedTasks).toBe(2);
    expect(result.progressPercentage).toBe(50);
    expect(result.statusLabel).toBe("MOMENTUM BUILDING");
    expect(result.hasTasks).toBe(true);
  });

  it("calculates 100% when all eligible tasks are completed", () => {
    const tasks: Task[] = [
      { ...baseTask, id: "1", status: "completed" },
      { ...baseTask, id: "2", status: "completed" },
    ];
    const result = calculateDailyProgress(tasks, "2026-10-19");
    expect(result.totalTasks).toBe(2);
    expect(result.completedTasks).toBe(2);
    expect(result.progressPercentage).toBe(100);
    expect(result.statusLabel).toBe("ALL PLANNED TASKS COMPLETED");
  });

  it("excludes archived and cancelled tasks from denominator", () => {
    const tasks: Task[] = [
      { ...baseTask, id: "1", status: "completed" },
      { ...baseTask, id: "2", status: "cancelled" },
      { ...baseTask, id: "3", status: "archived" },
      { ...baseTask, id: "4", status: "pending", archived_at: "2026-10-19T10:00:00Z" },
    ];
    const result = calculateDailyProgress(tasks, "2026-10-19");
    expect(result.totalTasks).toBe(1);
    expect(result.completedTasks).toBe(1);
    expect(result.progressPercentage).toBe(100);
  });

  it("tracks overdue tasks properly relative to reference date", () => {
    const tasks: Task[] = [
      { ...baseTask, id: "today-1", due_date: "2026-10-19", status: "pending" },
      { ...baseTask, id: "past-1", due_date: "2026-10-17", status: "pending" },
      { ...baseTask, id: "past-2", due_date: "2026-10-18", status: "completed" }, // completed is not overdue
    ];
    expect(isTaskOverdue(tasks[1], "2026-10-19")).toBe(true);
    expect(isTaskOverdue(tasks[2], "2026-10-19")).toBe(false);

    const result = calculateDailyProgress(tasks, "2026-10-19", "2026-10-19");
    expect(result.overdueTasks).toBe(1);
  });
});
