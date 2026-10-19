"use client";

import React, { useState } from "react";
import { AIGoalBreakdown, TaskCategory, TaskPriority } from "@/types";
import { Sparkles, Target, X, Check, Clock, Plus } from "lucide-react";
import { addDays } from "date-fns";
import { getTodayDateString } from "@/lib/dates/timezone";

interface GoalBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGeneratedTasks: (tasks: {
    title: string;
    category: TaskCategory;
    priority: TaskPriority;
    due_date: string;
    estimated_duration_minutes: number;
    tags?: string[];
  }[]) => Promise<void>;
}

export function GoalBreakdownModal({
  isOpen,
  onClose,
  onAddGeneratedTasks,
}: GoalBreakdownModalProps) {
  const [goalInput, setGoalInput] = useState(
    "Prepare for Java and DSA technical interviews over the next 30 days"
  );
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<AIGoalBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!goalInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalInput }),
      });
      const data = await res.json();
      if (res.ok && data.breakdown) {
        setBreakdown(data.breakdown);
      } else {
        setError(data.error || "Failed to decompose goal");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAdd = async () => {
    if (!breakdown) return;
    setIsSubmitting(true);
    const today = new Date();

    const formattedTasks = breakdown.tasks.map((t) => {
      const targetDate = addDays(today, t.target_day_offset || 1)
        .toISOString()
        .slice(0, 10);

      return {
        title: t.title,
        category: t.category,
        priority: t.priority,
        due_date: targetDate,
        estimated_duration_minutes: t.estimated_duration_minutes,
        tags: ["goal-breakdown", "gemini-plan"],
      };
    });

    await onAddGeneratedTasks(formattedTasks);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl bg-[#0E110E] border border-[#232A21] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#232A21]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#171C16] border border-[#384534] flex items-center justify-center text-[#C6FF5E]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#C6FF5E] uppercase tracking-widest">
                AI Roadmap Decomposition
              </div>
              <h2 className="text-lg font-bold text-[#F1F3EC]">Decompose Goal into Tasks</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#92988D] hover:text-[#F1F3EC] hover:bg-[#171C16] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!breakdown && !loading && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                  Target Goal or Ambition
                </label>
                <textarea
                  rows={3}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Master dynamic programming and build a distributed cache in 3 weeks..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111410] border border-[#232A21] text-sm text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[rgba(255,94,94,0.1)] border border-[rgba(255,94,94,0.3)] text-xs text-[#FF5E5E]">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full py-3 rounded-xl bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Decompose into Milestones</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="py-14 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#C6FF5E] border-t-transparent animate-spin mb-3" />
              <div className="font-mono text-xs text-[#F1F3EC]">
                Decomposing goal into progressive tasks...
              </div>
            </div>
          )}

          {breakdown && !loading && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111410] border border-[#232A21]">
                <h3 className="font-bold text-[#F1F3EC] text-sm">{breakdown.goal_title}</h3>
                <p className="text-xs text-[#92988D] mt-1">{breakdown.strategy_summary}</p>
                <div className="mt-2 text-[11px] font-mono text-[#C6FF5E]">
                  Estimated total commitment: {breakdown.estimated_total_hours} hours
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-mono uppercase text-[#92988D]">
                  Proposed Steps ({breakdown.tasks.length})
                </div>
                {breakdown.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#111410] border border-[#232A21] space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-[#F1F3EC]">{task.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171C16] border border-[#232A21] text-[#C6FF5E] whitespace-nowrap">
                        +{task.target_day_offset}d
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#92988D]">
                      <span>{task.category}</span>
                      <span>•</span>
                      <span>{task.estimated_duration_minutes}m</span>
                      <span>•</span>
                      <span className="capitalize">{task.priority} Priority</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {breakdown && !loading && (
          <div className="flex items-center justify-between p-6 border-t border-[#232A21] bg-[#090B09]">
            <button
              type="button"
              onClick={() => setBreakdown(null)}
              className="text-xs font-mono text-[#92988D] hover:text-[#F1F3EC]"
            >
              Re-edit Goal
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#232A21] text-xs font-mono text-[#92988D] hover:text-[#F1F3EC]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmAdd}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? "Adding..." : "Add All Tasks"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
