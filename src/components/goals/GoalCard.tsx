"use client";

import React from "react";
import { Goal } from "@/types";
import { Target, Calendar, Sparkles, CheckCircle2 } from "lucide-react";
import { formatFriendlyDate } from "@/lib/dates/timezone";

interface GoalCardProps {
  goal: Goal;
  onBreakdownWithAI: (goal: Goal) => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (id: string) => void;
}

export function GoalCard({ goal, onBreakdownWithAI, onEdit, onDelete }: GoalCardProps) {
  const total = goal.total_tasks_count || 0;
  const completed = goal.completed_tasks_count || 0;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21] hover:border-[#384534] transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#171C16] border border-[#232A21] flex items-center justify-center text-[#C6FF5E]">
              <Target className="w-4 h-4" />
            </div>
            {goal.category && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171C16] border border-[#232A21] text-[#92988D]">
                {goal.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#92988D]">
            <Calendar className="w-3.5 h-3.5 text-[#5E645A]" />
            <span>Target: {formatFriendlyDate(goal.target_date)}</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-[#F1F3EC] mt-3 group-hover:text-white transition-colors">
          {goal.title}
        </h3>

        {goal.description && (
          <p className="text-xs text-[#92988D] mt-1 line-clamp-2 leading-relaxed">
            {goal.description}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[#1C221A] space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[#92988D]">Milestone Trajectory</span>
            <span className="text-[#C6FF5E] font-bold">
              {completed}/{total} ({percentage}%)
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#171C16] overflow-hidden">
            <div
              className="h-full bg-[#C6FF5E] transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Gemini Breakdown Action */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => onBreakdownWithAI(goal)}
            className="flex items-center gap-1.5 text-xs font-mono text-[#C6FF5E] hover:text-[#e4ff9e] transition-colors py-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Breakdown</span>
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(goal.id)}
              className="text-[11px] font-mono text-[#5E645A] hover:text-[#FF5E5E] transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
