export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskCategory =
  | "Java"
  | "DSA"
  | "MERN Stack"
  | "College"
  | "Projects"
  | "Personal"
  | "Health and Fitness"
  | "Other";

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled" | "archived";

export interface RecurrenceRule {
  id: string;
  user_id: string;
  frequency: "daily" | "weekly" | "weekdays" | "custom_days";
  days_of_week?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  interval?: number; // e.g. every 1 day, every 2 weeks
  start_date: string; // ISO date YYYY-MM-DD
  end_date?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskOccurrence {
  id: string;
  recurrence_rule_id: string;
  user_id: string;
  scheduled_date: string; // YYYY-MM-DD
  status: "pending" | "completed" | "skipped";
  completed_at?: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string; // YYYY-MM-DD
  due_time?: string | null; // HH:mm
  reminder_at?: string | null;
  estimated_duration_minutes: number;
  tags: string[];
  recurrence_rule_id?: string | null;
  recurrence_rule?: RecurrenceRule;
  completed_at?: string | null;
  archived_at?: string | null;
  completion_notes?: string | null;
  goal_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  timezone: string;
  theme: "dark" | "light" | "system";
  week_start_preference: 0 | 1; // 0=Sunday, 1=Monday
  default_category: TaskCategory;
  default_duration_minutes: number;
  daily_planning_time: string; // e.g. "08:00"
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  browser_notifications_enabled: boolean;
  preferred_reminder_minutes_before: number;
  timezone: string;
  daily_planning_reminder: boolean;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string | null;
  task_title?: string;
  started_at: string;
  ended_at?: string | null;
  duration_minutes: number;
  status: "completed" | "abandoned" | "active";
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date: string;
  category?: TaskCategory | null;
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  total_tasks_count?: number;
  completed_tasks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DailyProgressCalculation {
  date: string;
  completedTasks: number;
  totalTasks: number;
  progressPercentage: number;
  overdueTasks: number;
  totalEstimatedMinutes: number;
  completedEstimatedMinutes: number;
  remainingEstimatedMinutes: number;
  statusLabel: string;
  hasTasks: boolean;
}

export interface AIPlanItem {
  task_id: string;
  task_title: string;
  suggested_start_time: string;
  suggested_end_time: string;
  priority_explanation: string;
  is_break?: boolean;
  rationale: string;
}

export interface AIDayPlan {
  headline: string;
  summary: string;
  schedule: AIPlanItem[];
  tips_for_momentum: string[];
}

export interface AIProductivityInsight {
  completion_rate_assessment: string;
  highlighted_accomplishment: string;
  identified_bottlenecks: string[];
  category_distribution_notes: string;
  momentum_score: number; // 1-100
  recommendations_for_tomorrow: string[];
}

export interface AIGoalTaskSuggestion {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimated_duration_minutes: number;
  target_day_offset: number; // days from now
  rationale: string;
}

export interface AIGoalBreakdown {
  goal_title: string;
  strategy_summary: string;
  tasks: AIGoalTaskSuggestion[];
  estimated_total_hours: number;
}
