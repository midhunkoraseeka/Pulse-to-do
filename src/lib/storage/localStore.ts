import { Task, Goal, Profile, RecurrenceRule, FocusSession, TaskOccurrence } from "@/types";
import { DEFAULT_PROFILE, getDefaultTasks, DEFAULT_GOALS, DEFAULT_RECURRENCE_RULES } from "./defaultData";
import { getTodayDateString } from "@/lib/dates/timezone";

const STORAGE_KEYS = {
  TASKS: "pulse_tasks_v1",
  GOALS: "pulse_goals_v1",
  PROFILE: "pulse_profile_v1",
  RECURRENCE: "pulse_recurrence_v1",
  OCCURRENCES: "pulse_occurrences_v1",
  FOCUS_SESSIONS: "pulse_focus_sessions_v1",
};

export const localStore = {
  getProfile(): Profile {
    if (typeof window === "undefined") return DEFAULT_PROFILE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: Profile): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      window.dispatchEvent(new Event("pulse_profile_updated"));
    } catch (e) {
      console.error("Failed to save profile locally", e);
    }
  },

  getTasks(): Task[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        const today = getTodayDateString();
        const initialTasks = getDefaultTasks(today);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
        return initialTasks;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      window.dispatchEvent(new Event("pulse_tasks_updated"));
    } catch (e) {
      console.error("Failed to save tasks locally", e);
    }
  },

  getGoals(): Goal[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
        return DEFAULT_GOALS;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveGoals(goals: Goal[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      window.dispatchEvent(new Event("pulse_goals_updated"));
    } catch (e) {
      console.error("Failed to save goals locally", e);
    }
  },

  getFocusSessions(): FocusSession[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addFocusSession(session: FocusSession): void {
    if (typeof window === "undefined") return;
    try {
      const sessions = this.getFocusSessions();
      sessions.unshift(session);
      localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
      window.dispatchEvent(new Event("pulse_focus_updated"));
    } catch (e) {
      console.error("Failed to add focus session", e);
    }
  },

  getRecurrenceRules(): RecurrenceRule[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRENCE);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.RECURRENCE, JSON.stringify(DEFAULT_RECURRENCE_RULES));
        return DEFAULT_RECURRENCE_RULES;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getOccurrences(): TaskOccurrence[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OCCURRENCES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveOccurrences(occurrences: TaskOccurrence[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.OCCURRENCES, JSON.stringify(occurrences));
    } catch (e) {
      console.error("Failed to save occurrences", e);
    }
  },
};
