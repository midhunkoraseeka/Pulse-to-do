import { z } from "zod";

export const TaskCategorySchema = z.enum([
  "Java",
  "DSA",
  "MERN Stack",
  "College",
  "Projects",
  "Personal",
  "Health and Fitness",
  "Other",
]);

export const TaskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const TaskStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
]);

export const TaskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000).optional().default(""),
  category: TaskCategorySchema,
  priority: TaskPrioritySchema.default("medium"),
  status: TaskStatusSchema.default("pending"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format"),
  due_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Due time must be in HH:mm format")
    .nullable()
    .optional(),
  reminder_at: z.string().nullable().optional(),
  estimated_duration_minutes: z.coerce.number().min(5).max(1440).default(30),
  tags: z.array(z.string().trim()).default([]),
  recurrence_rule_id: z.string().nullable().optional(),
  goal_id: z.string().nullable().optional(),
});

export const GoalInputSchema = z.object({
  title: z.string().trim().min(1, "Goal title is required").max(200),
  description: z.string().max(2000).optional().default(""),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target date must be in YYYY-MM-DD format"),
  category: TaskCategorySchema.nullable().optional(),
  status: z.enum(["not_started", "in_progress", "completed", "abandoned"]).default("not_started"),
});

export const ProfileUpdateSchema = z.object({
  display_name: z.string().trim().min(1).max(100),
  timezone: z.string().default("UTC"),
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  week_start_preference: z.union([z.literal(0), z.literal(1)]).default(1),
  default_category: TaskCategorySchema.default("Java"),
  default_duration_minutes: z.coerce.number().min(5).max(480).default(30),
  daily_planning_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default("08:00"),
});

export const FocusSessionInputSchema = z.object({
  task_id: z.string().nullable().optional(),
  duration_minutes: z.coerce.number().min(1).max(240),
  status: z.enum(["completed", "abandoned"]).default("completed"),
});

export const AIPlanItemSchema = z.object({
  task_id: z.string(),
  task_title: z.string(),
  suggested_start_time: z.string(),
  suggested_end_time: z.string(),
  priority_explanation: z.string(),
  is_break: z.boolean().optional(),
  rationale: z.string(),
});

export const AIDayPlanResponseSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  schedule: z.array(AIPlanItemSchema),
  tips_for_momentum: z.array(z.string()),
});

export const AIProductivityInsightResponseSchema = z.object({
  completion_rate_assessment: z.string(),
  highlighted_accomplishment: z.string(),
  identified_bottlenecks: z.array(z.string()),
  category_distribution_notes: z.string(),
  momentum_score: z.number().min(1).max(100),
  recommendations_for_tomorrow: z.array(z.string()),
});

export const AIGoalTaskSuggestionSchema = z.object({
  title: z.string(),
  category: TaskCategorySchema,
  priority: TaskPrioritySchema,
  estimated_duration_minutes: z.number().min(5).max(480),
  target_day_offset: z.number().min(0).max(365),
  rationale: z.string(),
});

export const AIGoalBreakdownResponseSchema = z.object({
  goal_title: z.string(),
  strategy_summary: z.string(),
  tasks: z.array(AIGoalTaskSuggestionSchema),
  estimated_total_hours: z.number(),
});
