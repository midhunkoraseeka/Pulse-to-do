"use client";

import React, { useState } from "react";
import { TaskCategory } from "@/types";
import { X, Target } from "lucide-react";
import { getTodayDateString } from "@/lib/dates/timezone";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    target_date: string;
    category?: TaskCategory | null;
  }) => Promise<void>;
}

const CATEGORIES: TaskCategory[] = [
  "DSA",
  "Java",
  "MERN Stack",
  "College",
  "Projects",
  "Personal",
  "Health and Fitness",
  "Other",
];

export function GoalModal({ isOpen, onClose, onSave }: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState(getTodayDateString());
  const [category, setCategory] = useState<TaskCategory>("DSA");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onSave({
      title: title.trim(),
      description: description.trim(),
      target_date: targetDate,
      category,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#0E110E] border border-[#232A21] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#232A21]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#C6FF5E]" />
            <h2 className="text-base font-bold text-[#F1F3EC]">Set Personal Goal</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#92988D] hover:text-[#F1F3EC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master SDE 150 LeetCode Patterns"
              className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
              Description / Success Criteria
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does done look like?"
              className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-2.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                Target Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#232A21]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#232A21] text-xs font-mono text-[#92988D]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase hover:bg-[#b5f547]"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
