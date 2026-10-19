import { Task, TaskCategory, FocusSession } from "@/types";
import { calculateDailyProgress } from "@/lib/progress/calculator";
import { format, subDays, parseISO } from "date-fns";

export interface DayTrendPoint {
  date: string;
  dayName: string;
  total: number;
  completed: number;
  percentage: number;
  hasTasks: boolean;
}

export interface CategoryMetric {
  category: TaskCategory;
  total: number;
  completed: number;
  totalMinutes: number;
  percentage: number;
}

export interface HeatmapDay {
  date: string;
  completedCount: number;
  percentage: number;
  hasTasks: boolean;
  level: 0 | 1 | 2 | 3 | 4; // for acid-lime brightness levels
}

export interface HistoricalSummary {
  totalCompletedAllTime: number;
  averageCompletionRate: number; // excluding days with 0 planned tasks
  totalFocusMinutes: number;
  mostProductiveCategory: string;
}

/**
 * Calculates 7-day trend up to referenceDate.
 */
export function calculate7DayTrend(tasks: Task[], referenceDateStr: string): DayTrendPoint[] {
  const result: DayTrendPoint[] = [];
  const refDate = new Date(`${referenceDateStr}T00:00:00Z`);

  for (let i = 6; i >= 0; i--) {
    const d = subDays(refDate, i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayProgress = calculateDailyProgress(tasks, dateStr, referenceDateStr);

    result.push({
      date: dateStr,
      dayName: format(d, "EEE"),
      total: dayProgress.totalTasks,
      completed: dayProgress.completedTasks,
      percentage: dayProgress.progressPercentage,
      hasTasks: dayProgress.hasTasks,
    });
  }

  return result;
}

/**
 * Calculates metrics grouped by category.
 */
export function calculateCategoryMetrics(tasks: Task[]): CategoryMetric[] {
  const categories: TaskCategory[] = [
    "DSA",
    "Java",
    "MERN Stack",
    "College",
    "Projects",
    "Personal",
    "Health and Fitness",
    "Other",
  ];

  return categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat && !t.archived_at && t.status !== "archived");
    const total = catTasks.length;
    const completed = catTasks.filter((t) => t.status === "completed").length;
    const totalMinutes = catTasks.reduce((acc, t) => acc + (t.estimated_duration_minutes || 0), 0);
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      category: cat,
      total,
      completed,
      totalMinutes,
      percentage,
    };
  });
}

/**
 * Generates past 28-day activity heatmap with 5 discrete intensity levels.
 */
export function calculateActivityHeatmap(tasks: Task[], referenceDateStr: string): HeatmapDay[] {
  const result: HeatmapDay[] = [];
  const refDate = new Date(`${referenceDateStr}T00:00:00Z`);

  for (let i = 27; i >= 0; i--) {
    const d = subDays(refDate, i);
    const dateStr = d.toISOString().slice(0, 10);
    const p = calculateDailyProgress(tasks, dateStr, referenceDateStr);

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (p.hasTasks) {
      if (p.progressPercentage >= 100) level = 4;
      else if (p.progressPercentage >= 75) level = 3;
      else if (p.progressPercentage >= 40) level = 2;
      else level = 1;
    }

    result.push({
      date: dateStr,
      completedCount: p.completedTasks,
      percentage: p.progressPercentage,
      hasTasks: p.hasTasks,
      level,
    });
  }

  return result;
}

/**
 * Calculates overall historical summary.
 */
export function calculateHistoricalSummary(
  tasks: Task[],
  focusSessions: FocusSession[],
  referenceDateStr: string
): HistoricalSummary {
  const allEligible = tasks.filter((t) => !t.archived_at && t.status !== "archived");
  const totalCompletedAllTime = allEligible.filter((t) => t.status === "completed").length;

  // Active days average: only days with hasTasks
  const pastTrend = calculate7DayTrend(tasks, referenceDateStr);
  const activeDays = pastTrend.filter((pt) => pt.hasTasks);
  const averageCompletionRate =
    activeDays.length === 0
      ? 0
      : Math.round(
          activeDays.reduce((acc, d) => acc + d.percentage, 0) / activeDays.length
        );

  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  const catMetrics = calculateCategoryMetrics(tasks);
  const mostProductive = [...catMetrics].sort((a, b) => b.completed - a.completed)[0];

  return {
    totalCompletedAllTime,
    averageCompletionRate,
    totalFocusMinutes,
    mostProductiveCategory: mostProductive?.completed > 0 ? mostProductive.category : "DSA",
  };
}
