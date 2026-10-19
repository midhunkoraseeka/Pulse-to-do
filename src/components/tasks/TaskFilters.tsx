"use client";

import React from "react";
import { TaskCategory, TaskPriority } from "@/types";
import { Filter, Layers, List } from "lucide-react";

interface TaskFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedPriority: string;
  onSelectPriority: (prio: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  viewMode: "list" | "grouped";
  onToggleViewMode: (mode: "list" | "grouped") => void;
}

const CATEGORIES: (TaskCategory | "ALL")[] = [
  "ALL",
  "DSA",
  "Java",
  "MERN Stack",
  "College",
  "Projects",
  "Personal",
  "Health and Fitness",
  "Other",
];

export function TaskFilters({
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  selectedStatus,
  onSelectStatus,
  viewMode,
  onToggleViewMode,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#0E110E] border border-[#232A21]">
      {/* Category Pills Slider / Wrap */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#C6FF5E] text-[#090B09] font-bold shadow-[0_0_8px_rgba(198,255,94,0.3)]"
                  : "bg-[#171C16] text-[#92988D] border border-[#232A21] hover:text-[#F1F3EC] hover:border-[#384534]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary Controls (Status, Priority, View Mode) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1C221A]">
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-[#171C16] border border-[#232A21] text-xs font-mono text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
          >
            <option value="ALL">All Status</option>
            <option value="incomplete">Incomplete Only</option>
            <option value="completed">Completed Only</option>
            <option value="overdue">Overdue Only</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => onSelectPriority(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-[#171C16] border border-[#232A21] text-xs font-mono text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
          >
            <option value="ALL">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#171C16] border border-[#232A21]">
          <button
            type="button"
            onClick={() => onToggleViewMode("list")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              viewMode === "list"
                ? "bg-[#232A21] text-[#C6FF5E] font-medium"
                : "text-[#92988D] hover:text-[#F1F3EC]"
            }`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode("grouped")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              viewMode === "grouped"
                ? "bg-[#232A21] text-[#C6FF5E] font-medium"
                : "text-[#92988D] hover:text-[#F1F3EC]"
            }`}
            title="Grouped by category view"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grouped</span>
          </button>
        </div>
      </div>
    </div>
  );
}
