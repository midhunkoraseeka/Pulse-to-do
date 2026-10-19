import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { AIDayPlanResponseSchema } from "@/lib/validation/schemas";
import { Task } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tasks: Task[] = body.tasks || [];
    const availableHours = body.availableHours || 8;

    if (!tasks || tasks.length === 0) {
      return NextResponse.json(
        { error: "No tasks provided for daily planning" },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // If Gemini is not configured, generate an intelligent algorithmic fallback plan
    if (!ai || !isGeminiConfigured) {
      const sorted = [...tasks]
        .filter((t) => t.status !== "completed")
        .sort((a, b) => {
          const prioMap = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (prioMap[b.priority] || 1) - (prioMap[a.priority] || 1);
        });

      let currentHour = 9;
      let currentMin = 0;

      const schedule = sorted.slice(0, 5).map((t, idx) => {
        const startStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
        const duration = t.estimated_duration_minutes || 45;
        const totalMinutes = currentHour * 60 + currentMin + duration;
        currentHour = Math.floor(totalMinutes / 60);
        currentMin = totalMinutes % 60;
        const endStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

        // Add 15 min buffer after task
        const bufferTotal = currentHour * 60 + currentMin + 15;
        currentHour = Math.floor(bufferTotal / 60);
        currentMin = bufferTotal % 60;

        return {
          task_id: t.id,
          task_title: t.title,
          suggested_start_time: startStr,
          suggested_end_time: endStr,
          priority_explanation: `Prioritized due to ${t.priority.toUpperCase()} urgency and ${t.category} focus.`,
          is_break: false,
          rationale: `Strategic morning focus block for highest cognitive impact.`,
        };
      });

      return NextResponse.json({
        configured: false,
        notice: "Gemini API key not configured. Displaying algorithmic fallback schedule.",
        plan: {
          headline: "Optimized Daily Momentum Schedule",
          summary: `Prioritized ${sorted.length} incomplete tasks sequenced by priority and cognitive load across ${availableHours} hours.`,
          schedule,
          tips_for_momentum: [
            "Tackle high-cognition DSA or Java tasks during your peak morning alertness window.",
            "Take deliberate 5-minute pauses between major modules to prevent mental fatigue.",
            "Protect deep work blocks from push notifications.",
          ],
        },
      });
    }

    // Live Gemini Execution
    const prompt = `You are Pulse AI, an elite productivity architect for high-performing computer science students.
Plan an optimal day schedule based on these exact user tasks:
${JSON.stringify(
  tasks.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    duration_minutes: t.estimated_duration_minutes,
    due_time: t.due_time,
    status: t.status,
  }))
)}

Available Work Hours: ${availableHours} hours starting at 09:00.
Requirements:
1. Schedule high priority and complex engineering tasks (DSA, Java, Systems) when cognitive energy is highest.
2. Group related items if possible.
3. Suggest realistic start and end times in HH:mm format.
4. Provide a clear priority explanation and momentum tips.
5. Return ONLY a valid JSON object matching this schema:
{
  "headline": string,
  "summary": string,
  "schedule": [
    {
      "task_id": string (must match provided task id),
      "task_title": string,
      "suggested_start_time": string,
      "suggested_end_time": string,
      "priority_explanation": string,
      "is_break": boolean,
      "rationale": string
    }
  ],
  "tips_for_momentum": [string]
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
    const validatedPlan = AIDayPlanResponseSchema.parse(parsed);

    return NextResponse.json({
      configured: true,
      plan: validatedPlan,
    });
  } catch (error: unknown) {
    console.error("AI Plan error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate AI plan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
