"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { TaskModal } from "@/components/tasks/TaskModal";
import { useTasks } from "@/hooks/useTasks";
import { checkAndTriggerReminders } from "@/lib/notifications/reminderManager";
import { Bell } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { tasks, addTask } = useTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [inAppAlert, setInAppAlert] = useState<string | null>(null);

  // Periodic reminder checker loop
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndTriggerReminders(tasks);
    }, 30000); // every 30 seconds

    const handleReminderEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      if (customEvent.detail?.message) {
        setInAppAlert(customEvent.detail.message);
        setTimeout(() => setInAppAlert(null), 8000);
      }
    };

    window.addEventListener("pulse_reminder_triggered", handleReminderEvent);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pulse_reminder_triggered", handleReminderEvent);
    };
  }, [tasks]);

  return (
    <div className="flex min-h-screen bg-[#090B09] text-[#F1F3EC]">
      {/* Navigation */}
      <Navigation />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* In-App Floating Notification Banner */}
        {inAppAlert && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#171C16] border border-[#C6FF5E] text-xs font-mono text-[#F1F3EC] shadow-2xl animate-in slide-in-from-top-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF5E] animate-ping" />
            <Bell className="w-4 h-4 text-[#C6FF5E]" />
            <span>{inAppAlert}</span>
            <button
              type="button"
              onClick={() => setInAppAlert(null)}
              className="ml-2 text-[#92988D] hover:text-[#F1F3EC]"
            >
              ✕
            </button>
          </div>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Global Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={async (taskData) => {
          const res = await addTask(taskData);
          return res;
        }}
      />
    </div>
  );
}
