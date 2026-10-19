"use client";

import React, { useState } from "react";
import { Task } from "@/types";
import { Calendar, ArrowRight, X, Sparkles, Check, AlertTriangle } from "lucide-react";
import { formatFriendlyDate } from "@/lib/dates/timezone";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  overdueTasks: Task[];
  onApplyReschedule: (updates: { taskId: string; newDueDate: string }[]) => Promise<void>;
}

interface RescheduleSuggestion {
  task_id: string;
  task_title: string;
  current_due_date: string;
  suggested_due_date: string;
  priority: string;
  reason: string;
}

export function RescheduleModal({
  isOpen,
  onClose,
  overdueTasks,
  onApplyReschedule,
}: RescheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RescheduleSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: overdueTasks }),
      });
      const data = await res.json();
      if (res.ok && data.reschedule?.suggestions) {
        setSuggestions(data.reschedule.suggestions);
      } else {
        setError(data.error || "Failed to generate rescheduling suggestions");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!suggestions) return;
    setIsApplying(true);
    const updates = suggestions.map((s) => ({
      taskId: s.task_id,
      newDueDate: s.suggested_due_date,
    }));
    await onApplyReschedule(updates);
    setIsApplying(false);
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
            <div className="w-9 h-9 rounded-xl bg-[#171C16] border border-[#384534] flex items-center justify-center text-[#FF9D5E]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#FF9D5E] uppercase tracking-widest">
                Workload Recovery
              </div>
              <h2 className="text-lg font-bold text-[#F1F3EC]">Intelligent Rescheduling</h2>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!suggestions && !loading && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[rgba(255,94,94,0.08)] border border-[rgba(255,94,94,0.2)] flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#FF5E5E] mt-0.5" />
                <div className="text-xs text-[#92988D]">
                  You have <strong className="text-[#F1F3EC]">{overdueTasks.length} overdue task(s)</strong>. Rather than dumping everything into today, Gemini paces them across upcoming open slots.
                </div>
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
                <span>Calculate Paced Reschedule</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#C6FF5E] border-t-transparent animate-spin mb-3" />
              <div className="font-mono text-xs text-[#F1F3EC]">Analyzing calendar density...</div>
            </div>
          )}

          {suggestions && !loading && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase text-[#92988D]">Proposed Realignment</div>
              {suggestions.map((s) => (
                <div
                  key={s.task_id}
                  className="p-3.5 rounded-xl bg-[#111410] border border-[#232A21] flex flex-col gap-2"
                >
                  <div className="text-sm font-medium text-[#F1F3EC]">{s.task_title}</div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#FF5E5E] line-through">
                      {formatFriendlyDate(s.current_due_date)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5E645A]" />
                    <span className="text-[#C6FF5E] font-bold">
                      {formatFriendlyDate(s.suggested_due_date)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#92988D]">{s.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {suggestions && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[#232A21] bg-[#090B09]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#232A21] text-xs font-mono text-[#92988D] hover:text-[#F1F3EC]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isApplying}
              onClick={handleConfirm}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isApplying ? "Updating..." : "Confirm & Apply"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
