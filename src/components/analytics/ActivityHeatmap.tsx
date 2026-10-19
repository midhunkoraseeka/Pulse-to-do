"use client";

import React from "react";
import { HeatmapDay } from "@/lib/analytics/calculator";
import { formatFriendlyDate } from "@/lib/dates/timezone";

interface ActivityHeatmapProps {
  days: HeatmapDay[];
}

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const getLevelStyle = (level: number) => {
    switch (level) {
      case 4:
        return "bg-[#C6FF5E] border-[#C6FF5E] shadow-[0_0_8px_rgba(198,255,94,0.4)]";
      case 3:
        return "bg-[rgba(198,255,94,0.7)] border-[rgba(198,255,94,0.8)]";
      case 2:
        return "bg-[rgba(198,255,94,0.45)] border-[rgba(198,255,94,0.5)]";
      case 1:
        return "bg-[rgba(198,255,94,0.2)] border-[rgba(198,255,94,0.3)]";
      default:
        return "bg-[#171C16] border-[#232A21]";
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#92988D]">
            Consistency Matrix
          </div>
          <h3 className="text-base font-bold text-[#F1F3EC]">4-Week Momentum Heatmap</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#92988D]">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-[#171C16] border border-[#232A21]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[rgba(198,255,94,0.3)]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[rgba(198,255,94,0.6)]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#C6FF5E]" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
        {days.map((day) => (
          <div
            key={day.date}
            className="group relative flex flex-col items-center"
          >
            <div
              className={`w-full aspect-square rounded-md border transition-all hover:scale-110 cursor-pointer ${getLevelStyle(
                day.level
              )}`}
            />

            {/* Hover Tooltip */}
            <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
              <div className="px-2.5 py-1 rounded-md bg-[#1C221A] border border-[#384534] text-[10px] font-mono whitespace-nowrap shadow-xl">
                <span className="text-[#C6FF5E] font-bold">
                  {day.hasTasks ? `${day.percentage}% complete` : "No tasks"}
                </span>
                <span className="text-[#92988D] ml-1">({formatFriendlyDate(day.date)})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
