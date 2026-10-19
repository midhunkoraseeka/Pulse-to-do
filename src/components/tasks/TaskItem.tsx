"use client";

import React from "react";
import { Task, TaskPriority, TaskCategory } from "@/types";
import { Check, Clock, Trash2, Edit3, Play, AlertCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { formatFriendlyTime } from "@/lib/dates/timezone";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, coords?: { x: number; y: number }) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStartFocus?: (task: Task) => void;
  isOverdue?: boolean;
}

const CATEGORY_COLORS: Record<TaskCategory, { text: string; bg: string; border: string }> = {
  Java: { text: "#E58A5E", bg: "rgba(229, 138, 94, 0.12)", border: "rgba(229, 138, 94, 0.25)" },
  DSA: { text: "#C6FF5E", bg: "rgba(198, 255, 94, 0.12)", border: "rgba(198, 255, 94, 0.25)" },
  "MERN Stack": { text: "#5EE5FF", bg: "rgba(94, 229, 255, 0.12)", border: "rgba(94, 229, 255, 0.25)" },
  College: { text: "#B78CFF", bg: "rgba(183, 140, 255, 0.12)", border: "rgba(183, 140, 255, 0.25)" },
  Projects: { text: "#FFDF5E", bg: "rgba(255, 223, 94, 0.12)", border: "rgba(255, 223, 94, 0.25)" },
  Personal: { text: "#92988D", bg: "rgba(146, 152, 141, 0.12)", border: "rgba(146, 152, 141, 0.25)" },
  "Health and Fitness": { text: "#5EFFB0", bg: "rgba(94, 255, 176, 0.12)", border: "rgba(94, 255, 176, 0.25)" },
  Other: { text: "#71796E", bg: "rgba(113, 121, 110, 0.12)", border: "rgba(113, 121, 110, 0.25)" },
};

const PRIORITY_BADGES: Record<TaskPriority, { text: string; label: string; dot: string }> = {
  urgent: { text: "text-[#FF5E5E]", label: "URGENT", dot: "bg-[#FF5E5E]" },
  high: { text: "text-[#FF9D5E]", label: "HIGH", dot: "bg-[#FF9D5E]" },
  medium: { text: "text-[#FFDF5E]", label: "MED", dot: "bg-[#FFDF5E]" },
  low: { text: "text-[#92988D]", label: "LOW", dot: "bg-[#92988D]" },
};

export function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
  isOverdue = false,
}: TaskItemProps) {
  const isCompleted = task.status === "completed";
  const catStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
  const prioStyle = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

  const handleCheckboxClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const coords = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    onToggleComplete(task.id, coords);
  };

  return (
    <div
      className={`group relative flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
        isCompleted
          ? "bg-[#0E110E] border-[#1C221A] opacity-60"
          : isOverdue
          ? "bg-[#161111] border-[rgba(255,94,94,0.3)] hover:border-[rgba(255,94,94,0.5)]"
          : "bg-[#111410] border-[#232A21] hover:border-[#384534] hover:bg-[#151914]"
      }`}
    >
      {/* Left: Custom Checkbox + Task Information */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`mt-0.5 sm:mt-0 w-5 h-5 rounded flex items-center justify-center transition-all flex-shrink-0 ${
            isCompleted
              ? "bg-[#C6FF5E] border border-[#C6FF5E] text-[#090B09] shadow-[0_0_8px_rgba(198,255,94,0.4)]"
              : "border border-[#384534] bg-[#171C16] hover:border-[#C6FF5E]"
          }`}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-medium tracking-tight transition-all break-words ${
                isCompleted
                  ? "line-through text-[#5E645A]"
                  : "text-[#F1F3EC] group-hover:text-white"
              }`}
            >
              {task.title}
            </span>

            {/* Overdue Warning Pill */}
            {isOverdue && !isCompleted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[rgba(255,94,94,0.12)] text-[#FF5E5E] border border-[rgba(255,94,94,0.25)]">
                <AlertCircle className="w-3 h-3" />
                OVERDUE
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-[#92988D] mt-0.5 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Category */}
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded font-medium border"
              style={{
                color: catStyle.text,
                backgroundColor: catStyle.bg,
                borderColor: catStyle.border,
              }}
            >
              {task.category}
            </span>

            {/* Priority */}
            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#171C16] border border-[#232A21]">
              <span className={`w-1.5 h-1.5 rounded-full ${prioStyle.dot}`} />
              <span className={prioStyle.text}>{prioStyle.label}</span>
            </span>

            {/* Duration */}
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#92988D]">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(task.estimated_duration_minutes)}</span>
            </span>

            {/* Due Time */}
            {task.due_time && (
              <span className="text-[10px] font-mono text-[#5E645A]">
                @ {formatFriendlyTime(task.due_time)}
              </span>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono text-[#5E645A] bg-[#171C16] px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {onStartFocus && !isCompleted && (
          <button
            type="button"
            onClick={() => onStartFocus(task)}
            className="p-1.5 rounded-lg text-[#92988D] hover:text-[#C6FF5E] hover:bg-[#171C16] transition-colors"
            title="Start focus timer with this task"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-[#92988D] hover:text-[#F1F3EC] hover:bg-[#171C16] transition-colors"
            title="Edit task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-[#92988D] hover:text-[#FF5E5E] hover:bg-[#171C16] transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
