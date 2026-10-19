"use client";

import React, { useState, useEffect } from "react";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { X, Sparkles } from "lucide-react";
import { getTodayDateString } from "@/lib/dates/timezone";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    due_date: string;
    due_time?: string | null;
    estimated_duration_minutes: number;
    tags?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  initialTask?: Task | null;
}

const CATEGORIES: TaskCategory[] = [
  "Java",
  "DSA",
  "MERN Stack",
  "College",
  "Projects",
  "Personal",
  "Health and Fitness",
  "Other",
];

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "text-[#92988D]" },
  { value: "medium", label: "Medium", color: "text-[#FFDF5E]" },
  { value: "high", label: "High", color: "text-[#FF9D5E]" },
  { value: "urgent", label: "Urgent", color: "text-[#FF5E5E]" },
];

export function TaskModal({ isOpen, onClose, onSave, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("DSA");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState("");
  const [duration, setDuration] = useState(45);
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || "");
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setDueDate(initialTask.due_date);
      setDueTime(initialTask.due_time || "");
      setDuration(initialTask.estimated_duration_minutes || 30);
      setTagsInput(initialTask.tags?.join(", ") || "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("DSA");
      setPriority("medium");
      setDueDate(getTodayDateString());
      setDueTime("");
      setDuration(45);
      setTagsInput("");
    }
    setErrorMsg(null);
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Task title is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const res = await onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      due_date: dueDate,
      due_time: dueTime || null,
      estimated_duration_minutes: duration,
      tags,
    });

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to save task");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0E110E] border border-[#232A21] p-6 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232A21]">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#C6FF5E] uppercase">
              {initialTask ? "Update Item" : "Create Task"}
            </div>
            <h2 className="text-lg font-bold text-[#F1F3EC]">
              {initialTask ? "Edit Focus Task" : "Add New Task"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#92988D] hover:text-[#F1F3EC] hover:bg-[#171C16] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-[rgba(255,94,94,0.1)] border border-[rgba(255,94,94,0.3)] text-xs text-[#FF5E5E]">
            {errorMsg}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solve LeetCode #207 Course Schedule"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#111410] border border-[#232A21] text-sm text-[#F1F3EC] placeholder-[#5E645A] focus:outline-none focus:border-[#C6FF5E] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key sub-steps, formulas, edge cases..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] placeholder-[#5E645A] focus:outline-none focus:border-[#C6FF5E] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] transition-colors"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] transition-colors"
              >
              </input>
            </div>

            {/* Due Time */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                Time (optional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] transition-colors"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] transition-colors"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. graphs, bfs, dfs, interview"
              className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] placeholder-[#5E645A] focus:outline-none focus:border-[#C6FF5E] transition-colors"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#232A21]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#232A21] text-xs font-mono text-[#92988D] hover:text-[#F1F3EC] hover:bg-[#171C16] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold tracking-wider uppercase hover:bg-[#b5f547] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : initialTask ? "Update Task" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
