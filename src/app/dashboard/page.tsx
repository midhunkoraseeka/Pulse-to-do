"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { LivingProgressField } from "@/components/progress/LivingProgressField";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskModal } from "@/components/tasks/TaskModal";
import { FocusTimer } from "@/components/timer/FocusTimer";
import { DayPlanModal } from "@/components/ai/DayPlanModal";
import { RescheduleModal } from "@/components/ai/RescheduleModal";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types";
import { formatDuration } from "@/lib/utils";
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Flame,
} from "lucide-react";

export default function DashboardPage() {
  const {
    tasks,
    dateTasks,
    overdueTasks,
    progress,
    toggleTaskComplete,
    deleteTask,
    updateTask,
    addTask,
  } = useTasks();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = dateTasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const nextUpcomingTask = dateTasks.find(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  );

  return (
    <AppShell>
      <Header
        onOpenAddTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onSearchChange={setSearchQuery}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Top Grid: Signature Living Progress Field + Daily Focus Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Living Progress Field (7 cols on large desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <LivingProgressField progress={progress} className="h-[380px]" />

            {/* Daily Status Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0E110E] border border-[#232A21]">
                <div className="text-[10px] font-mono text-[#92988D] uppercase tracking-wider">
                  Planned Today
                </div>
                <div className="font-mono-numbers text-xl font-bold text-[#F1F3EC] mt-0.5">
                  {progress.totalTasks}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E110E] border border-[#232A21]">
                <div className="text-[10px] font-mono text-[#92988D] uppercase tracking-wider">
                  Completed
                </div>
                <div className="font-mono-numbers text-xl font-bold text-[#C6FF5E] mt-0.5">
                  {progress.completedTasks}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E110E] border border-[#232A21]">
                <div className="text-[10px] font-mono text-[#92988D] uppercase tracking-wider">
                  Remaining Work
                </div>
                <div className="font-mono-numbers text-xl font-bold text-[#F1F3EC] mt-0.5">
                  {formatDuration(progress.remainingEstimatedMinutes)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E110E] border border-[#232A21]">
                <div className="text-[10px] font-mono text-[#92988D] uppercase tracking-wider">
                  Overdue Tasks
                </div>
                <div
                  className={`font-mono-numbers text-xl font-bold mt-0.5 ${
                    progress.overdueTasks > 0 ? "text-[#FF5E5E]" : "text-[#92988D]"
                  }`}
                >
                  {progress.overdueTasks}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Focus & Timer Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Integrated Focus Timer */}
            <FocusTimer
              activeTask={activeFocusTask}
              onClearActiveTask={() => setActiveFocusTask(null)}
            />

            {/* AI Day Planning Shortcut Card */}
            <div className="p-4 rounded-2xl bg-[#0E110E] border border-[#232A21] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#171C16] border border-[#384534] flex items-center justify-center text-[#C6FF5E]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F1F3EC]">AI Daily Optimization</div>
                  <div className="text-[11px] font-mono text-[#92988D]">
                    Structure your deep work with Gemini
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPlanModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[rgba(198,255,94,0.12)] text-[#C6FF5E] border border-[rgba(198,255,94,0.3)] hover:bg-[#C6FF5E] hover:text-[#090B09] font-mono text-xs font-bold transition-all"
              >
                Plan Day
              </button>
            </div>
          </div>
        </div>

        {/* Overdue Alert Banner if any */}
        {overdueTasks.length > 0 && (
          <div className="p-4 rounded-xl bg-[#171111] border border-[rgba(255,94,94,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF5E5E] flex-shrink-0" />
              <div>
                <span className="text-sm font-semibold text-[#FF5E5E]">
                  {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""} from Previous Sprints
                </span>
                <p className="text-xs text-[#92988D]">
                  Overdue tasks are flagged separately to keep today&apos;s completion percentage deterministic.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRescheduleModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[rgba(255,94,94,0.15)] text-[#FF5E5E] border border-[rgba(255,94,94,0.3)] hover:bg-[#FF5E5E] hover:text-black font-mono text-xs font-bold uppercase transition-all whitespace-nowrap"
            >
              Intelligent Reschedule
            </button>
          </div>
        )}

        {/* Task Stream Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#232A21]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6FF5E]" />
              <h2 className="text-lg font-bold text-[#F1F3EC]">Today&apos;s Task Stream</h2>
              <span className="text-xs font-mono text-[#92988D]">
                ({filteredTasks.length} items)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="text-xs font-mono text-[#C6FF5E] hover:underline"
            >
              + Add Item
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-3">
              <p className="text-sm font-mono text-[#92988D]">NO TASKS FOUND FOR TODAY</p>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase"
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskComplete}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDelete={deleteTask}
                  onStartFocus={(t) => setActiveFocusTask(t)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        initialTask={editingTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={async (data) => {
          if (editingTask) {
            await updateTask(editingTask.id, data);
            return { success: true };
          } else {
            return await addTask(data);
          }
        }}
      />

      {/* AI Day Planning Modal */}
      <DayPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        tasks={dateTasks}
      />

      {/* AI Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        overdueTasks={overdueTasks}
        onApplyReschedule={async (updates) => {
          for (const u of updates) {
            await updateTask(u.taskId, { due_date: u.newDueDate });
          }
        }}
      />
    </AppShell>
  );
}
