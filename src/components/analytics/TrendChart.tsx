"use client";

import React from "react";
import { DayTrendPoint } from "@/lib/analytics/calculator";

interface TrendChartProps {
  trend: DayTrendPoint[];
}

export function TrendChart({ trend }: TrendChartProps) {
  return (
    <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#92988D]">
            7-Day Momentum Trajectory
          </div>
          <h3 className="text-base font-bold text-[#F1F3EC]">Completion Trend</h3>
        </div>
        <div className="text-xs font-mono text-[#C6FF5E] bg-[#171C16] px-2.5 py-1 rounded border border-[#232A21]">
          Last 7 Days
        </div>
      </div>

      {/* Responsive Custom SVG & Grid Bar Chart */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 border-b border-[#232A21]">
        {trend.map((point) => {
          const heightPercent = point.hasTasks ? Math.max(8, point.percentage) : 0;
          return (
            <div key={point.date} className="flex flex-col items-center h-full justify-end group">
              <div className="text-[10px] font-mono text-[#C6FF5E] opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                {point.hasTasks ? `${point.percentage}%` : "--"}
              </div>

              {/* Bar */}
              <div className="w-full max-w-[42px] bg-[#171C16] rounded-t-lg overflow-hidden flex flex-col justify-end border-t border-x border-[#232A21] h-32 relative">
                {point.hasTasks && (
                  <div
                    className="w-full bg-[#C6FF5E] transition-all duration-500 rounded-t-sm"
                    style={{
                      height: `${heightPercent}%`,
                      opacity: point.percentage === 100 ? 1 : point.percentage > 50 ? 0.8 : 0.45,
                    }}
                  />
                )}
                {!point.hasTasks && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-[#5E645A]">off</span>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <div className="text-xs font-mono font-medium text-[#F1F3EC]">{point.dayName}</div>
                <div className="text-[9px] font-mono text-[#92988D]">
                  {point.hasTasks ? `${point.completed}/${point.total}` : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
