"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Task } from "@/types";
import { localStore } from "@/lib/storage/localStore";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Play, Pause, RotateCcw, Coffee, Sparkles, CheckCircle2 } from "lucide-react";

interface FocusTimerProps {
  activeTask?: Task | null;
  onClearActiveTask?: () => void;
  className?: string;
}

type TimerMode = "focus" | "shortBreak" | "longBreak";

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function FocusTimer({ activeTask, onClearActiveTask, className = "" }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_DURATIONS.focus);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const targetEndTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize clean focus complete chime with Web Audio API
  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio not permitted or supported
    }
  }, []);

  const completeSession = useCallback(async () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    playChime();

    const durationMins = Math.round(DEFAULT_DURATIONS[mode] / 60);

    const sessionData = {
      id: `focus_${Date.now()}`,
      user_id: "local_user_dev",
      task_id: activeTask?.id || null,
      task_title: activeTask?.title || "Free Focus",
      started_at: new Date(Date.now() - durationMins * 60000).toISOString(),
      ended_at: new Date().toISOString(),
      duration_minutes: durationMins,
      status: "completed" as const,
      created_at: new Date().toISOString(),
    };

    localStore.addFocusSession(sessionData);

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from("focus_sessions").insert([sessionData]);
      }
    }

    setCompletedSessionsCount((c) => c + 1);

    // Auto-advance mode
    if (mode === "focus") {
      setMode("shortBreak");
      setRemainingSeconds(DEFAULT_DURATIONS.shortBreak);
    } else {
      setMode("focus");
      setRemainingSeconds(DEFAULT_DURATIONS.focus);
    }
  }, [mode, activeTask, playChime]);

  // Tick loop based on absolute timestamps
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const diff = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          completeSession();
        }
      }, 500);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, completeSession]);

  const handleStart = () => {
    targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    setIsRunning(true);
  };

  const handlePause = () => {
    if (targetEndTimeRef.current) {
      const diff = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
      setRemainingSeconds(diff);
    }
    targetEndTimeRef.current = null;
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setRemainingSeconds(DEFAULT_DURATIONS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setMode(newMode);
    setRemainingSeconds(DEFAULT_DURATIONS[newMode]);
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeDisplay = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const totalDuration = DEFAULT_DURATIONS[mode];
  const progressRatio = (totalDuration - remainingSeconds) / totalDuration;

  return (
    <div
      className={`relative p-6 rounded-2xl bg-[#0E110E] border border-[#232A21] overflow-hidden select-none ${className}`}
    >
      {/* Mode Selectors */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171C16] border border-[#232A21]">
          <button
            type="button"
            onClick={() => switchMode("focus")}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
              mode === "focus"
                ? "bg-[#232A21] text-[#C6FF5E] font-bold"
                : "text-[#92988D] hover:text-[#F1F3EC]"
            }`}
          >
            Focus (25m)
          </button>
          <button
            type="button"
            onClick={() => switchMode("shortBreak")}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
              mode === "shortBreak"
                ? "bg-[#232A21] text-[#5EE5FF] font-bold"
                : "text-[#92988D] hover:text-[#F1F3EC]"
            }`}
          >
            Short Break (5m)
          </button>
          <button
            type="button"
            onClick={() => switchMode("longBreak")}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
              mode === "longBreak"
                ? "bg-[#232A21] text-[#B78CFF] font-bold"
                : "text-[#92988D] hover:text-[#F1F3EC]"
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#92988D] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#C6FF5E]" />
          <span>{completedSessionsCount} sessions today</span>
        </div>
      </div>

      {/* Linked Task Bar if active */}
      {activeTask && (
        <div className="mb-4 p-2.5 rounded-lg bg-[#171C16] border border-[#384534] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#C6FF5E] animate-pulse" />
            <span className="font-mono text-[#92988D]">Target:</span>
            <span className="font-medium text-[#F1F3EC] truncate">{activeTask.title}</span>
          </div>
          {onClearActiveTask && (
            <button
              type="button"
              onClick={onClearActiveTask}
              className="text-[11px] font-mono text-[#92988D] hover:text-[#FF5E5E] ml-2"
            >
              Detach
            </button>
          )}
        </div>
      )}

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative font-mono-numbers text-6xl md:text-7xl font-black tracking-tight text-[#F1F3EC]">
          {timeDisplay}
        </div>
        <div className="mt-2 text-xs font-mono text-[#92988D] uppercase tracking-widest flex items-center gap-2">
          {mode === "focus" ? (
            <>
              <Sparkles className="w-3 h-3 text-[#C6FF5E]" />
              <span>Deep Work Immersion</span>
            </>
          ) : (
            <>
              <Coffee className="w-3 h-3 text-[#5EE5FF]" />
              <span>Rest & Cognitive Reset</span>
            </>
          )}
        </div>

        {/* Progress bar line */}
        <div className="w-full max-w-xs h-1 rounded-full bg-[#171C16] mt-6 overflow-hidden">
          <div
            className="h-full bg-[#C6FF5E] transition-all duration-300"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={handleReset}
          className="p-3 rounded-xl bg-[#171C16] border border-[#232A21] text-[#92988D] hover:text-[#F1F3EC] hover:border-[#384534] transition-all"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {isRunning ? (
          <button
            type="button"
            onClick={handlePause}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F261E] border border-[#384534] text-[#F1F3EC] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#283226] active:scale-95 transition-all"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] active:scale-95 transition-all shadow-[0_0_20px_rgba(198,255,94,0.3)]"
          >
            <Play className="w-4 h-4" />
            <span>Start Session</span>
          </button>
        )}
      </div>
    </div>
  );
}
