"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalModal } from "@/components/goals/GoalModal";
import { GoalBreakdownModal } from "@/components/goals/GoalBreakdownModal";
import { localStore } from "@/lib/storage/localStore";
import { useTasks } from "@/hooks/useTasks";
import { Goal, TaskCategory, TaskPriority } from "@/types";
import { Plus, Target, Sparkles } from "lucide-react";

export default function GoalsPage() {
  const { addTask } = useTasks();
  const [goals, setGoals] = useState<Goal[]>(() => localStore.getGoals());
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [selectedGoalForBreakdown, setSelectedGoalForBreakdown] = useState<Goal | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setGoals(localStore.getGoals());
    };
    window.addEventListener("pulse_goals_updated", handleUpdate);
    return () => {
      window.removeEventListener("pulse_goals_updated", handleUpdate);
    };
  }, []);

  const handleSaveGoal = async (data: {
    title: string;
    description?: string;
    target_date: string;
    category?: TaskCategory | null;
  }) => {
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      user_id: "local_user_dev",
      title: data.title,
      description: data.description || "",
      target_date: data.target_date,
      category: data.category || null,
      status: "in_progress",
      total_tasks_count: 0,
      completed_tasks_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    localStore.saveGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter((g) => g.id !== goalId);
    setGoals(updated);
    localStore.saveGoals(updated);
  };

  const handleAddGeneratedTasks = async (
    generatedTasks: {
      title: string;
      category: TaskCategory;
      priority: TaskPriority;
      due_date: string;
      estimated_duration_minutes: number;
      tags?: string[];
    }[]
  ) => {
    for (const t of generatedTasks) {
      await addTask(t);
    }
    // Update goal task count
    if (selectedGoalForBreakdown) {
      const updated = goals.map((g) => {
        if (g.id === selectedGoalForBreakdown.id) {
          return {
            ...g,
            total_tasks_count: (g.total_tasks_count || 0) + generatedTasks.length,
          };
        }
        return g;
      });
      setGoals(updated);
      localStore.saveGoals(updated);
    }
  };

  return (
    <AppShell>
      <Header onOpenAddTask={() => {}} />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EC]">
              Goals & Milestones
            </h1>
            <p className="text-xs font-mono text-[#92988D]">
              Decompose ambitions into structured daily engineering milestones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedGoalForBreakdown(null);
                setIsBreakdownModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[rgba(198,255,94,0.12)] text-[#C6FF5E] border border-[rgba(198,255,94,0.3)] hover:bg-[#C6FF5E] hover:text-[#090B09] font-mono text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Breakdown</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGoalModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </button>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-3">
            <Target className="w-8 h-8 text-[#5E645A] mx-auto" />
            <div className="font-mono text-sm text-[#92988D]">NO ACTIVE GOALS</div>
            <p className="text-xs text-[#5E645A]">
              Set an ambitious target date for interviews, projects, or certifications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onBreakdownWithAI={(g) => {
                  setSelectedGoalForBreakdown(g);
                  setIsBreakdownModalOpen(true);
                }}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />

      <GoalBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => {
          setIsBreakdownModalOpen(false);
          setSelectedGoalForBreakdown(null);
        }}
        onAddGeneratedTasks={handleAddGeneratedTasks}
      />
    </AppShell>
  );
}
