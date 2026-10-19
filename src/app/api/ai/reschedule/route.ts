import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { Task } from "@/types";
import { addDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tasks: Task[] = body.tasks || [];
    const todayStr = body.today || new Date().toISOString().slice(0, 10);

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: "No tasks to reschedule" }, { status: 400 });
    }

    const ai = getGeminiClient();

    if (!ai || !isGeminiConfigured) {
      const today = new Date(`${todayStr}T00:00:00Z`);
      const suggestions = tasks.map((t, idx) => {
        const offset = Math.floor(idx / 2) + 1; // max 2 tasks shifted per day
        const targetDate = addDays(today, offset).toISOString().slice(0, 10);
        return {
          task_id: t.id,
          task_title: t.title,
          current_due_date: t.due_date,
          suggested_due_date: targetDate,
          priority: t.priority,
          reason: `Evenly paced to prevent cognitive overload. Allocated to Day +${offset}.`,
        };
      });

      return NextResponse.json({
        configured: false,
        notice: "Gemini API key not configured. Displaying algorithmic pacing schedule.",
        reschedule: {
          strategy: "Paced redistribution: Max 2 rescheduled items per day alongside existing routines.",
          suggestions,
        },
      });
    }

    const prompt = `You are Pulse AI, helping a CS student intelligently reschedule overdue or bottlenecked tasks.
Tasks to reschedule:
${JSON.stringify(tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, current_due_date: t.due_date, category: t.category })))}
Reference Date (Today): ${todayStr}

Return JSON with a balanced redistribution across the next 3 to 5 days, prioritizing urgent and high-impact tasks:
{
  "strategy": string,
  "suggestions": [
    {
      "task_id": string,
      "task_title": string,
      "current_due_date": string,
      "suggested_due_date": string (YYYY-MM-DD),
      "priority": string,
      "reason": string
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      configured: true,
      reschedule: parsed,
    });
  } catch (error: unknown) {
    console.error("AI Reschedule error:", error);
    const msg = error instanceof Error ? error.message : "Failed to reschedule";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
