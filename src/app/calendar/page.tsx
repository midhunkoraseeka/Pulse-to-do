"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { LivingProgressField } from "@/components/progress/LivingProgressField";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskModal } from "@/components/tasks/TaskModal";
import { useTasks } from "@/hooks/useTasks";
import { calculateDailyProgress } from "@/lib/progress/calculator";
import { getTodayDateString, formatFriendlyDate } from "@/lib/dates/timezone";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { Task } from "@/types";

export default function CalendarPage() {
  const { tasks, toggleTaskComplete, deleteTask, updateTask, addTask } = useTasks();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date("2026-10-01T00:00:00Z"));
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-10-19");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setCurrentMonth(new Date());
    setSelectedDateStr(getTodayDateString());
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDayProgress = useMemo(() => {
    return calculateDailyProgress(tasks, selectedDateStr, getTodayDateString());
  }, [tasks, selectedDateStr]);

  const selectedDayTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.due_date === selectedDateStr && !t.archived_at && t.status !== "archived"
    );
  }, [tasks, selectedDateStr]);

  return (
    <AppShell>
      <Header
        onOpenAddTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EC]">
              Calendar & Schedule
            </h1>
            <p className="text-xs font-mono text-[#92988D]">
              Inspect daily timelines and planned engineering sprints
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg bg-[#111410] border border-[#232A21] text-[#92988D] hover:text-[#F1F3EC]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-mono font-bold text-[#F1F3EC] px-3">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg bg-[#111410] border border-[#232A21] text-[#92988D] hover:text-[#F1F3EC]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0E110E] border border-[#232A21] p-4 sm:p-6">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-[10px] font-mono text-[#5E645A] uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day) => {
                const dayStr = day.toISOString().slice(0, 10);
                const isSelected = dayStr === selectedDateStr;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const dayTasks = tasks.filter(
                  (t) => t.due_date === dayStr && !t.archived_at && t.status !== "archived"
                );
                const hasPending = dayTasks.some((t) => t.status !== "completed");
                const allCompleted = dayTasks.length > 0 && !hasPending;

                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => setSelectedDateStr(dayStr)}
                    className={`min-h-[64px] sm:min-h-[72px] p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all ${
                      isSelected
                        ? "bg-[#171C16] border-[#C6FF5E] shadow-[0_0_12px_rgba(198,255,94,0.15)]"
                        : isCurrentMonth
                        ? "bg-[#111410] border-[#232A21] hover:border-[#384534]"
                        : "bg-[#090B09] border-transparent opacity-40"
                    }`}
                  >
                    <span
                      className={`text-xs font-mono font-medium ${
                        isSelected ? "text-[#C6FF5E] font-bold" : "text-[#F1F3EC]"
                      }`}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Task dots */}
                    {dayTasks.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            allCompleted ? "bg-[#C6FF5E]" : "bg-[#FFDF5E]"
                          }`}
                        />
                        <span className="text-[9px] font-mono text-[#92988D]">
                          {dayTasks.length}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#0E110E] border border-[#232A21] flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-[#C6FF5E] uppercase tracking-wider">
                  Inspecting Date
                </div>
                <h3 className="text-base font-bold text-[#F1F3EC]">
                  {formatFriendlyDate(selectedDateStr)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-[#C6FF5E] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add for this day</span>
              </button>
            </div>

            {/* Living Progress Field for Selected Date */}
            <LivingProgressField progress={selectedDayProgress} className="h-[280px]" />

            {/* Selected Date Tasks */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-[#92988D]">
                Scheduled Tasks ({selectedDayTasks.length})
              </div>
              {selectedDayTasks.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#0E110E] border border-[#232A21] text-xs font-mono text-[#5E645A]">
                  No tasks scheduled on this date.
                </div>
              ) : (
                selectedDayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskComplete}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
            return await addTask({ ...data, due_date: selectedDateStr });
          }
        }}
      />
    </AppShell>
  );
}
