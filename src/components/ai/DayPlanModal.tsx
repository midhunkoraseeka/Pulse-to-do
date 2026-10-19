"use client";

import React, { useState } from "react";
import { Task, AIDayPlan } from "@/types";
import { Sparkles, Clock, Check, X, ArrowRight, AlertCircle } from "lucide-react";

interface DayPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onApplyPlan?: (plan: AIDayPlan) => void;
}

export function DayPlanModal({ isOpen, onClose, tasks, onApplyPlan }: DayPlanModalProps) {
  const [availableHours, setAvailableHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AIDayPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks, availableHours }),
      });
      const data = await res.json();
      if (res.ok && data.plan) {
        setPlan(data.plan);
        setIsConfigured(data.configured ?? true);
      } else {
        setError(data.error || "Failed to generate plan");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (plan && onApplyPlan) {
      onApplyPlan(plan);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0E110E] border border-[#232A21] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#232A21]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#171C16] border border-[#384534] flex items-center justify-center text-[#C6FF5E]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#C6FF5E] uppercase tracking-widest">
                Gemini Architecture
              </div>
              <h2 className="text-lg font-bold text-[#F1F3EC]">Plan My Day</h2>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!plan && !loading && (
            <div className="space-y-4">
              <p className="text-sm text-[#92988D]">
                Gemini will analyze your {tasks.length} active tasks, their priorities, estimated durations, and cognitive load to construct a sequenced, fatigue-resistant daily schedule.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase text-[#92988D] mb-2">
                  Target Deep Work Hours Today: <span className="text-[#C6FF5E] font-bold">{availableHours} hrs</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={1}
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full accent-[#C6FF5E] bg-[#171C16] h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#111410] border border-[#232A21] flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C6FF5E] mt-0.5" />
                <div className="text-xs text-[#92988D]">
                  <strong className="text-[#F1F3EC]">Non-Destructive Principle:</strong> Gemini proposes an optimized timeline. You inspect and confirm before applying.
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
                className="w-full py-3 rounded-xl bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] active:scale-95 transition-all shadow-[0_0_20px_rgba(198,255,94,0.25)] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Intelligent Schedule</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#C6FF5E] border-t-transparent animate-spin mb-4" />
              <div className="font-mono text-sm text-[#F1F3EC]">Synthesizing optimal schedule...</div>
              <p className="text-xs text-[#92988D] mt-1">Balancing DSA complexity, concurrency, and breaks.</p>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-6">
              {!isConfigured && (
                <div className="p-3 rounded-lg bg-[rgba(255,191,94,0.1)] border border-[rgba(255,191,94,0.3)] text-xs text-[#FFBF5E] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Showing algorithmic blueprint. Set GEMINI_API_KEY in .env.local for live model generation.</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#111410] border border-[#232A21]">
                <h3 className="font-mono text-base font-bold text-[#C6FF5E]">{plan.headline}</h3>
                <p className="text-xs text-[#92988D] mt-1 leading-relaxed">{plan.summary}</p>
              </div>

              {/* Schedule list */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase text-[#92988D] tracking-wider">
                  Timeline
                </div>
                {plan.schedule.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-[#111410] border border-[#232A21] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#C6FF5E] px-2 py-1 rounded bg-[#171C16] border border-[#232A21] whitespace-nowrap">
                        {item.suggested_start_time} - {item.suggested_end_time}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-[#F1F3EC]">{item.task_title}</div>
                        <div className="text-xs text-[#92988D] mt-0.5">{item.priority_explanation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Momentum tips */}
              {plan.tips_for_momentum && plan.tips_for_momentum.length > 0 && (
                <div className="p-4 rounded-xl bg-[#171C16] border border-[#232A21]">
                  <div className="text-xs font-mono uppercase text-[#C6FF5E] tracking-wider mb-2">
                    Momentum Multipliers
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#92988D]">
                    {plan.tips_for_momentum.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#C6FF5E] mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {plan && !loading && (
          <div className="flex items-center justify-between p-6 border-t border-[#232A21] bg-[#090B09]">
            <button
              type="button"
              onClick={() => setPlan(null)}
              className="text-xs font-mono text-[#92988D] hover:text-[#F1F3EC]"
            >
              Regenerate
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#232A21] text-xs font-mono text-[#92988D] hover:text-[#F1F3EC]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Accept Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
