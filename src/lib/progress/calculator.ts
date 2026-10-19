import { Task, DailyProgressCalculation } from "@/types";

/**
 * Checks whether a task is eligible for daily progress calculation on a given target date.
 * Excludes archived and cancelled tasks.
 */
export function isTaskEligible(task: Task, targetDate: string): boolean {
  if (task.archived_at || task.status === "archived" || task.status === "cancelled") {
    return false;
  }
  return task.due_date === targetDate;
}

/**
 * Checks whether a task is overdue relative to reference date (today).
 */
export function isTaskOverdue(task: Task, referenceDate: string): boolean {
  if (task.archived_at || task.status === "archived" || task.status === "cancelled" || task.status === "completed") {
    return false;
  }
  return task.due_date < referenceDate;
}

/**
 * Authoritative, deterministic calculation for daily progress.
 * Follows the core rule:
 * completedTasks = count of completed, eligible task instances
 * totalTasks = count of all eligible, non-archived, non-cancelled task instances
 * percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
 */
export function calculateDailyProgress(
  tasks: Task[],
  targetDate: string,
  referenceTodayDate: string = targetDate
): DailyProgressCalculation {
  const eligibleTasks = tasks.filter((t) => isTaskEligible(t, targetDate));
  const overdueTasksCount = tasks.filter((t) => isTaskOverdue(t, referenceTodayDate)).length;

  const totalTasks = eligibleTasks.length;
  const completedTasks = eligibleTasks.filter((t) => t.status === "completed").length;

  const progressPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const totalEstimatedMinutes = eligibleTasks.reduce(
    (acc, t) => acc + (t.estimated_duration_minutes || 0),
    0
  );

  const completedEstimatedMinutes = eligibleTasks
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + (t.estimated_duration_minutes || 0), 0);

  const remainingEstimatedMinutes = Math.max(0, totalEstimatedMinutes - completedEstimatedMinutes);

  let statusLabel: string;
  if (totalTasks === 0) {
    statusLabel = "NO TASKS PLANNED";
  } else if (progressPercentage === 100) {
    statusLabel = "ALL PLANNED TASKS COMPLETED";
  } else if (progressPercentage >= 76) {
    statusLabel = "STRONG MOMENTUM — CLOSING IN";
  } else if (progressPercentage >= 51) {
    statusLabel = "SOLID PROGRESS — STAY FOCUSED";
  } else if (progressPercentage >= 26) {
    statusLabel = "MOMENTUM BUILDING";
  } else if (progressPercentage > 0) {
    statusLabel = "GETTING STARTED";
  } else {
    statusLabel = "READY TO INITIATE";
  }

  return {
    date: targetDate,
    completedTasks,
    totalTasks,
    progressPercentage,
    overdueTasks: overdueTasksCount,
    totalEstimatedMinutes,
    completedEstimatedMinutes,
    remainingEstimatedMinutes,
    statusLabel,
    hasTasks: totalTasks > 0,
  };
}
