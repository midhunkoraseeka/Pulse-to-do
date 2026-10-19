"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { AICoachChat } from "@/components/ai/AICoachChat";
import { DayPlanModal } from "@/components/ai/DayPlanModal";
import { RescheduleModal } from "@/components/ai/RescheduleModal";
import { GoalBreakdownModal } from "@/components/goals/GoalBreakdownModal";
import { useTasks } from "@/hooks/useTasks";
import { Sparkles, Calendar, Target, Clock, AlertCircle } from "lucide-react";

export default function AICoachPage() {
  const { tasks, overdueTasks, dateTasks, progress, addTask, updateTask } = useTasks();
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  return (
    <AppShell>
      <Header onOpenAddTask={() => {}} />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EC]">
              Gemini AI Coach
            </h1>
            <p className="text-xs font-mono text-[#92988D]">
              Intelligent planning, study mentoring, algorithmic roadmaps, and scheduling
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] hover:border-[#C6FF5E] text-[#F1F3EC] font-mono text-xs transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-[#C6FF5E]" />
              <span>Plan My Day</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRescheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] hover:border-[#FF9D5E] text-[#F1F3EC] font-mono text-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#FF9D5E]" />
              <span>Reschedule Overdue</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBreakdownModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] hover:border-[#B78CFF] text-[#F1F3EC] font-mono text-xs transition-colors"
            >
              <Target className="w-3.5 h-3.5 text-[#B78CFF]" />
              <span>Decompose Goal</span>
            </button>
          </div>
        </div>

        {/* Conversational Assistant */}
        <AICoachChat tasks={tasks} progress={progress} />
      </div>

      <DayPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        tasks={dateTasks}
      />

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

      <GoalBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        onAddGeneratedTasks={async (newTasks) => {
          for (const t of newTasks) {
            await addTask(t);
          }
        }}
      />
    </AppShell>
  );
}
