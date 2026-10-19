"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { TrendChart } from "@/components/analytics/TrendChart";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { CategoryBreakdown } from "@/components/analytics/CategoryBreakdown";
import { useTasks } from "@/hooks/useTasks";
import { localStore } from "@/lib/storage/localStore";
import {
  calculate7DayTrend,
  calculateCategoryMetrics,
  calculateActivityHeatmap,
  calculateHistoricalSummary,
} from "@/lib/analytics/calculator";
import { getTodayDateString } from "@/lib/dates/timezone";
import { formatDuration } from "@/lib/utils";
import { Sparkles, Trophy, Flame, Clock, Target, AlertCircle } from "lucide-react";
import { AIProductivityInsight } from "@/types";

export default function AnalyticsPage() {
  const { tasks, progress } = useTasks();
  const [focusSessions, setFocusSessions] = useState(() => localStore.getFocusSessions());
  const [aiInsight, setAiInsight] = useState<AIProductivityInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState<string>("2026-10-19");

  useEffect(() => {
    setTodayStr(getTodayDateString());
  }, []);

  useEffect(() => {
    const handleFocusUpdate = () => {
      setFocusSessions(localStore.getFocusSessions());
    };
    window.addEventListener("pulse_focus_updated", handleFocusUpdate);
    return () => {
      window.removeEventListener("pulse_focus_updated", handleFocusUpdate);
    };
  }, []);

  const trend = useMemo(() => calculate7DayTrend(tasks, todayStr), [tasks, todayStr]);
  const categoryMetrics = useMemo(() => calculateCategoryMetrics(tasks), [tasks]);
  const heatmapDays = useMemo(() => calculateActivityHeatmap(tasks, todayStr), [tasks, todayStr]);
  const summary = useMemo(
    () => calculateHistoricalSummary(tasks, focusSessions, todayStr),
    [tasks, focusSessions, todayStr]
  );

  const handleGenerateInsights = async () => {
    setLoadingAi(true);
    setAiNotice(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressPercentage: progress.progressPercentage,
          completedTasks: progress.completedTasks,
          totalTasks: progress.totalTasks,
          overdueTasks: progress.overdueTasks,
          categorySummary: categoryMetrics.map((c) => ({
            category: c.category,
            completed: c.completed,
            total: c.total,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.insights) {
        setAiInsight(data.insights);
        if (data.notice) setAiNotice(data.notice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <AppShell>
      <Header onOpenAddTask={() => {}} />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EC]">
              Productivity Intelligence
            </h1>
            <p className="text-xs font-mono text-[#92988D]">
              Deterministic historical metrics and machine intelligence synthesis
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateInsights}
            disabled={loadingAi}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(198,255,94,0.12)] text-[#C6FF5E] border border-[rgba(198,255,94,0.3)] hover:bg-[#C6FF5E] hover:text-[#090B09] font-mono text-xs font-bold transition-all self-start"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingAi ? "Synthesizing..." : "Generate AI Insights"}</span>
          </button>
        </div>

        {/* 4 Summary Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#92988D]">
                Completed All-Time
              </span>
              <Trophy className="w-4 h-4 text-[#C6FF5E]" />
            </div>
            <div className="font-mono-numbers text-3xl font-black text-[#F1F3EC]">
              {summary.totalCompletedAllTime}
            </div>
            <p className="text-[11px] text-[#5E645A]">Verified task completions</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#92988D]">
                Active Days Average
              </span>
              <Flame className="w-4 h-4 text-[#FFDF5E]" />
            </div>
            <div className="font-mono-numbers text-3xl font-black text-[#F1F3EC]">
              {summary.averageCompletionRate}%
            </div>
            <p className="text-[11px] text-[#5E645A]">Excludes zero-planned days</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#92988D]">
                Total Focus Time
              </span>
              <Clock className="w-4 h-4 text-[#5EE5FF]" />
            </div>
            <div className="font-mono-numbers text-3xl font-black text-[#F1F3EC]">
              {formatDuration(summary.totalFocusMinutes)}
            </div>
            <p className="text-[11px] text-[#5E645A]">Recorded in timer sessions</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#92988D]">
                Peak Domain
              </span>
              <Target className="w-4 h-4 text-[#B78CFF]" />
            </div>
            <div className="font-mono text-2xl font-black text-[#F1F3EC] truncate">
              {summary.mostProductiveCategory}
            </div>
            <p className="text-[11px] text-[#5E645A]">Highest completed volume</p>
          </div>
        </div>

        {/* Gemini AI Synthesis Card (if generated) */}
        {aiInsight && (
          <div className="p-6 rounded-2xl bg-[#111410] border border-[#384534] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C6FF5E]" />
                <h3 className="text-base font-bold text-[#F1F3EC]">
                  Gemini Productivity Analysis
                </h3>
              </div>
              <div className="text-xs font-mono text-[#C6FF5E] bg-[#171C16] px-3 py-1 rounded-full border border-[#232A21]">
                Momentum Score: {aiInsight.momentum_score}/100
              </div>
            </div>

            {aiNotice && (
              <div className="text-xs text-[#FFBF5E] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{aiNotice}</span>
              </div>
            )}

            <p className="text-sm text-[#D8DCD3] leading-relaxed">
              {aiInsight.completion_rate_assessment}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#0E110E] border border-[#232A21]">
                <div className="text-xs font-mono text-[#C6FF5E] uppercase mb-1">
                  Key Accomplishment
                </div>
                <p className="text-xs text-[#92988D]">{aiInsight.highlighted_accomplishment}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0E110E] border border-[#232A21]">
                <div className="text-xs font-mono text-[#FFDF5E] uppercase mb-1">
                  Recommendations For Tomorrow
                </div>
                <ul className="text-xs text-[#92988D] space-y-1">
                  {aiInsight.recommendations_for_tomorrow.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Trend Chart */}
        <TrendChart trend={trend} />

        {/* 4-Week Activity Heatmap */}
        <ActivityHeatmap days={heatmapDays} />

        {/* Category Breakdown */}
        <CategoryBreakdown metrics={categoryMetrics} />
      </div>
    </AppShell>
  );
}
