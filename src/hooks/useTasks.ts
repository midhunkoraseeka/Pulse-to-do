"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Task, TaskPriority, TaskCategory, DailyProgressCalculation } from "@/types";
import { localStore } from "@/lib/storage/localStore";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { calculateDailyProgress } from "@/lib/progress/calculator";
import { getTodayDateString } from "@/lib/dates/timezone";
import { TaskInputSchema } from "@/lib/validation/schemas";

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

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { data, error: sbError } = await supabase
            .from("tasks")
            .select("*")
            .order("due_date", { ascending: true });

          if (sbError) {
            console.warn("Supabase fetch failed, falling back to local store:", sbError.message);
            setTasks(localStore.getTasks());
          } else if (data) {
            setTasks(data as Task[]);
          }
        } else {
          setTasks(localStore.getTasks());
        }
      } else {
        setTasks(localStore.getTasks());
      }
    } catch (err: unknown) {
      console.error("Error loading tasks", err);
      setTasks(localStore.getTasks());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const handleLocalUpdate = () => {
      setTasks(localStore.getTasks());
    };

    window.addEventListener("pulse_tasks_updated", handleLocalUpdate);
    return () => {
      window.removeEventListener("pulse_tasks_updated", handleLocalUpdate);
    };
  }, [loadTasks]);

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
        const newTask: Task = {
          id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          user_id: "local_user_dev",
          title: validated.title,
          description: validated.description || "",
          category: validated.category,
          priority: validated.priority,
          status: "pending",
          due_date: validated.due_date,
          due_time: validated.due_time || null,
          estimated_duration_minutes: validated.estimated_duration_minutes,
          tags: validated.tags || [],
          goal_id: validated.goal_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (isSupabaseConfigured) {
          const supabase = createClient();
          if (supabase) {
            const { error: insertError } = await supabase.from("tasks").insert([newTask]);
            if (insertError) {
              console.warn("Supabase insert error, persisting locally:", insertError);
            }
          }
        }

        const currentTasks = localStore.getTasks();
        const updated = [newTask, ...currentTasks];
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

      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: (isNowCompleted ? "completed" : "pending") as Task["status"],
            completed_at: isNowCompleted ? nowIso : null,
            updated_at: nowIso,
          };
        }
        return t;
      });

      // Optimistic update
      setTasks(updated);
      localStore.saveTasks(updated);

      // Dispatch ripple event for Custom Cursor if completed
      if (isNowCompleted && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pulse_task_completed", { detail: clickCoords })
        );
      }

      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          await supabase
            .from("tasks")
            .update({
              status: isNowCompleted ? "completed" : "pending",
              completed_at: isNowCompleted ? nowIso : null,
              updated_at: nowIso,
            })
            .eq("id", taskId);
        }
      }
    },
    [tasks]
  );

  // Update Task
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      });

      setTasks(updated);
      localStore.saveTasks(updated);

      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          await supabase
            .from("tasks")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", taskId);
        }
      }
    },
    [tasks]
  );

  // Delete Task
  const deleteTask = useCallback(
    async (taskId: string) => {
      const updated = tasks.filter((t) => t.id !== taskId);
      setTasks(updated);
      localStore.saveTasks(updated);

      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          await supabase.from("tasks").delete().eq("id", taskId);
        }
      }
    },
    [tasks]
  );

  // Archive Task
  const archiveTask = useCallback(
    async (taskId: string) => {
      const now = new Date().toISOString();
      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: "archived" as Task["status"],
            archived_at: now,
            updated_at: now,
          };
        }
        return t;
      });

      setTasks(updated);
      localStore.saveTasks(updated);

      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          await supabase
            .from("tasks")
            .update({ status: "archived", archived_at: now, updated_at: now })
            .eq("id", taskId);
        }
      }
    },
    [tasks]
  );

  // Bulk complete
  const bulkComplete = useCallback(
    async (taskIds: string[]) => {
      const now = new Date().toISOString();
      const updated = tasks.map((t) => {
        if (taskIds.includes(t.id)) {
          return {
            ...t,
            status: "completed" as Task["status"],
            completed_at: now,
            updated_at: now,
          };
        }
        return t;
      });
      setTasks(updated);
      localStore.saveTasks(updated);
    },
    [tasks]
  );

  // Bulk delete
  const bulkDelete = useCallback(
    async (taskIds: string[]) => {
      const updated = tasks.filter((t) => !taskIds.includes(t.id));
      setTasks(updated);
      localStore.saveTasks(updated);
    },
    [tasks]
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
