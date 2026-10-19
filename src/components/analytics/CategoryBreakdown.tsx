"use client";

import React from "react";
import { CategoryMetric } from "@/lib/analytics/calculator";
import { formatDuration } from "@/lib/utils";

interface CategoryBreakdownProps {
  metrics: CategoryMetric[];
}

export function CategoryBreakdown({ metrics }: CategoryBreakdownProps) {
  return (
    <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21]">
      <div className="text-[10px] font-mono uppercase tracking-widest text-[#92988D] mb-1">
        Domain Distribution
      </div>
      <h3 className="text-base font-bold text-[#F1F3EC] mb-4">Category Performance</h3>

      <div className="space-y-3.5">
        {metrics.map((metric) => (
          <div key={metric.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-medium text-[#F1F3EC]">{metric.category}</span>
              <div className="flex items-center gap-3 text-[#92988D]">
                <span>{formatDuration(metric.totalMinutes)}</span>
                <span className="text-[#C6FF5E] font-bold">
                  {metric.completed}/{metric.total} ({metric.percentage}%)
                </span>
              </div>
            </div>

            {/* Bar */}
            <div className="h-1.5 rounded-full bg-[#171C16] overflow-hidden">
              <div
                className="h-full bg-[#C6FF5E] transition-all duration-500 rounded-full"
                style={{ width: `${metric.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
