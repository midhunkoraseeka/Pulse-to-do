"use client";

import { Task } from "@/types";

const NOTIFIED_CACHE_KEY = "pulse_notified_reminders_v1";

function getNotifiedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(NOTIFIED_CACHE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedSet(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFIED_CACHE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  const result = await Notification.requestPermission();
  return result;
}

export function checkAndTriggerReminders(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  const permission = "Notification" in window ? Notification.permission : "default";
  const notified = getNotifiedSet();
  const now = new Date();
  const nowHourMin = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const todayStr = now.toISOString().slice(0, 10);

  tasks.forEach((task) => {
    if (task.status === "completed" || task.status === "archived") return;
    if (task.due_date !== todayStr || !task.due_time) return;

    // Check if task is due in the current or next minute
    const cacheId = `${task.id}_${todayStr}_${task.due_time}`;
    if (notified.has(cacheId)) return;

    if (task.due_time <= nowHourMin) {
      notified.add(cacheId);
      saveNotifiedSet(notified);

      // Trigger In-App event
      window.dispatchEvent(
        new CustomEvent("pulse_reminder_triggered", {
          detail: {
            task,
            message: `Task due now: ${task.title} (${task.category})`,
          },
        })
      );

      // Trigger Browser Notification if granted
      if (permission === "granted") {
        try {
          new Notification(`Pulse: Focus Alert`, {
            body: `${task.title} is scheduled for now (${task.category}).`,
            icon: "/icons/icon-192.png",
          });
        } catch (e) {
          console.warn("Failed to trigger browser notification", e);
        }
      }
    }
  });
}
