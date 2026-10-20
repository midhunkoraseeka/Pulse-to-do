"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Task, TaskPriority, TaskCategory, DailyProgressCalculation } from "@/types";
import { localStore } from "@/lib/storage/localStore";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { calculateDailyProgress } from "@/lib/progress/calculator";
import { getTodayDateString } from "@/lib/dates/timezone";
import { TaskInputSchema } from "@/lib/validation/schemas";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof createClient>>;
type CloudWrite = (
  supabase: SupabaseBrowserClient
) => PromiseLike<{ error: { message: string } | null }>;

// Fired after any task write so every useTasks instance (shell, page) stays in sync
const TASKS_UPDATED_EVENT = "pulse_tasks_updated";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Goals still live in browser storage, so their local ids can't be referenced in the DB
function cloudGoalId(goalId: string | null | undefined) {
  return goalId && UUID_RE.test(goalId) ? goalId : null;
}

// Postgres TIME comes back as HH:mm:ss; the UI works in HH:mm
function normalizeTask(row: Task): Task {
  return {
    ...row,
    due_time: row.due_time ? row.due_time.slice(0, 5) : null,
    tags: row.tags ?? [],
  };
}

// Strip fields the client must not (or cannot) write to the tasks table
function toCloudUpdate(updates: Partial<Task>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, user_id, created_at, recurrence_rule, ...rest } = updates;
  return "goal_id" in rest ? { ...rest, goal_id: cloudGoalId(rest.goal_id) } : rest;
}

function getCloudClient() {
  return isSupabaseConfigured ? createClient() : null;
}

export function useTasks(selectedDate?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentToday, setCurrentToday] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentToday(getTodayDateString());
  }, []);

  const todayDate = currentToday || "2026-10-19";
  const targetDate = selectedDate || todayDate;

  // Signed-in users only ever see their own rows from Supabase (RLS-scoped);
  // seeded demo tasks exist only in local preview mode
  const fetchTasks = useCallback(async () => {
    const supabase = getCloudClient();
    if (!supabase) {
      setTasks(localStore.getTasks());
      return;
    }

    const { data, error: sbError } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true });

    if (sbError) {
      console.error("Failed to load tasks:", sbError.message);
      setError(sbError.message);
      setTasks([]);
    } else {
      setTasks(((data ?? []) as Task[]).map(normalizeTask));
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchTasks();
    } catch (err: unknown) {
      console.error("Error loading tasks", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  useEffect(() => {
    loadTasks();

    const handleTasksUpdated = () => {
      fetchTasks();
    };

    window.addEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
    };
  }, [loadTasks, fetchTasks]);

  // Apply an optimistic update, then persist it to Supabase or browser storage
  const commit = useCallback(
    async (updated: Task[], cloudWrite: CloudWrite) => {
      setTasks(updated);

      const supabase = getCloudClient();
      if (!supabase) {
        localStore.saveTasks(updated);
        return;
      }

      const { error: writeError } = await cloudWrite(supabase);
      if (writeError) {
        console.error("Failed to save task change:", writeError.message);
        setError(writeError.message);
        await fetchTasks();
        return;
      }
      window.dispatchEvent(new Event(TASKS_UPDATED_EVENT));
    },
    [fetchTasks]
  );

  // Daily Progress Calculation using shared, authoritative engine
  const progress: DailyProgressCalculation = useMemo(() => {
    return calculateDailyProgress(tasks, targetDate, todayDate);
  }, [tasks, targetDate, todayDate]);

  // Tasks for current target date
  const dateTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.due_date === targetDate && !t.archived_at && t.status !== "archived"
    );
  }, [tasks, targetDate]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.due_date < todayDate &&
        t.status !== "completed" &&
        t.status !== "cancelled" &&
        !t.archived_at
    );
  }, [tasks, todayDate]);

  // Add Task
  const addTask = useCallback(
    async (taskData: {
      title: string;
      description?: string;
      category: TaskCategory;
      priority: TaskPriority;
      due_date: string;
      due_time?: string | null;
      estimated_duration_minutes: number;
      tags?: string[];
      goal_id?: string | null;
    }) => {
      try {
        const validated = TaskInputSchema.parse(taskData);
        const fields = {
          title: validated.title,
          description: validated.description || "",
          category: validated.category,
          priority: validated.priority,
          status: "pending" as Task["status"],
          due_date: validated.due_date,
          due_time: validated.due_time || null,
          estimated_duration_minutes: validated.estimated_duration_minutes,
          tags: validated.tags || [],
        };

        const supabase = getCloudClient();
        if (supabase) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("Your session has expired. Please sign in again.");

          // Let the database generate the id and timestamps
          const { data, error: insertError } = await supabase
            .from("tasks")
            .insert({ ...fields, user_id: user.id, goal_id: cloudGoalId(validated.goal_id) })
            .select()
            .single();
          if (insertError) throw new Error(insertError.message);

          const newTask = normalizeTask(data as Task);
          setTasks((prev) => [newTask, ...prev]);
          window.dispatchEvent(new Event(TASKS_UPDATED_EVENT));
          return { success: true, task: newTask };
        }

        const nowIso = new Date().toISOString();
        const newTask: Task = {
          ...fields,
          id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          user_id: "local_user_dev",
          goal_id: validated.goal_id || null,
          created_at: nowIso,
          updated_at: nowIso,
        };
        const updated = [newTask, ...localStore.getTasks()];
        localStore.saveTasks(updated);
        setTasks(updated);
        return { success: true, task: newTask };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create task";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    []
  );

  // Toggle Task Complete
  const toggleTaskComplete = useCallback(
    async (taskId: string, clickCoords?: { x: number; y: number }) => {
      const targetTask = tasks.find((t) => t.id === taskId);
      if (!targetTask) return;

      const isNowCompleted = targetTask.status !== "completed";
      const nowIso = new Date().toISOString();
      const changes = {
        status: (isNowCompleted ? "completed" : "pending") as Task["status"],
        completed_at: isNowCompleted ? nowIso : null,
        updated_at: nowIso,
      };

      // Dispatch ripple event for Custom Cursor if completed
      if (isNowCompleted && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pulse_task_completed", { detail: clickCoords })
        );
      }

      await commit(
        tasks.map((t) => (t.id === taskId ? { ...t, ...changes } : t)),
        (supabase) => supabase.from("tasks").update(changes).eq("id", taskId)
      );
    },
    [tasks, commit]
  );

  // Update Task
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      const updatedAt = new Date().toISOString();
      await commit(
        tasks.map((t) => (t.id === taskId ? { ...t, ...updates, updated_at: updatedAt } : t)),
        (supabase) =>
          supabase
            .from("tasks")
            .update({ ...toCloudUpdate(updates), updated_at: updatedAt })
            .eq("id", taskId)
      );
    },
    [tasks, commit]
  );

  // Delete Task
  const deleteTask = useCallback(
    async (taskId: string) => {
      await commit(
        tasks.filter((t) => t.id !== taskId),
        (supabase) => supabase.from("tasks").delete().eq("id", taskId)
      );
    },
    [tasks, commit]
  );

  // Archive Task
  const archiveTask = useCallback(
    async (taskId: string) => {
      const now = new Date().toISOString();
      const changes = {
        status: "archived" as Task["status"],
        archived_at: now,
        updated_at: now,
      };
      await commit(
        tasks.map((t) => (t.id === taskId ? { ...t, ...changes } : t)),
        (supabase) => supabase.from("tasks").update(changes).eq("id", taskId)
      );
    },
    [tasks, commit]
  );

  // Bulk complete
  const bulkComplete = useCallback(
    async (taskIds: string[]) => {
      const now = new Date().toISOString();
      const changes = {
        status: "completed" as Task["status"],
        completed_at: now,
        updated_at: now,
      };
      await commit(
        tasks.map((t) => (taskIds.includes(t.id) ? { ...t, ...changes } : t)),
        (supabase) => supabase.from("tasks").update(changes).in("id", taskIds)
      );
    },
    [tasks, commit]
  );

  // Bulk delete
  const bulkDelete = useCallback(
    async (taskIds: string[]) => {
      await commit(
        tasks.filter((t) => !taskIds.includes(t.id)),
        (supabase) => supabase.from("tasks").delete().in("id", taskIds)
      );
    },
    [tasks, commit]
  );

  return {
    tasks,
    dateTasks,
    overdueTasks,
    progress,
    isLoading,
    error,
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    archiveTask,
    bulkComplete,
    bulkDelete,
    refreshTasks: loadTasks,
  };
}
