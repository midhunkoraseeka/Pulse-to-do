import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { AIGoalBreakdownResponseSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const goalTitle = body.goal || "Master SDE technical interview";

    const ai = getGeminiClient();

    if (!ai || !isGeminiConfigured) {
      return NextResponse.json({
        configured: false,
        notice: "Gemini API key not configured. Displaying structured roadmap blueprint.",
        breakdown: {
          goal_title: goalTitle,
          strategy_summary: `Structured 4-phase milestone decomposition for '${goalTitle}' covering fundamental patterns, concurrency, system design, and mock sprints.`,
          tasks: [
            {
              title: "Phase 1: Arrays, Two Pointers & Sliding Window Core Patterns",
              category: "DSA",
              priority: "high",
              estimated_duration_minutes: 60,
              target_day_offset: 1,
              rationale: "Foundational algorithmic technique frequently tested in screening rounds.",
            },
            {
              title: "Phase 2: Java Collections Deep Dive (HashMap internals & ConcurrentHashMap)",
              category: "Java",
              priority: "urgent",
              estimated_duration_minutes: 60,
              target_day_offset: 3,
              rationale: "Essential core Java memory model and synchronization questions.",
            },
            {
              title: "Phase 3: Trees, Graphs & BFS/DFS Shortest Path Variations",
              category: "DSA",
              priority: "high",
              estimated_duration_minutes: 90,
              target_day_offset: 7,
              rationale: "Graph traversals form 30% of tier-1 tech interviews.",
            },
            {
              title: "Phase 4: Full Stack Architecture (REST, Caching, Token Auth)",
              category: "MERN Stack",
              priority: "medium",
              estimated_duration_minutes: 75,
              target_day_offset: 14,
              rationale: "Demonstrates practical production engineering capabilities.",
            },
            {
              title: "Phase 5: Dynamic Programming Memoization vs Tabulation",
              category: "DSA",
              priority: "high",
              estimated_duration_minutes: 90,
              target_day_offset: 21,
              rationale: "Master Knapsack and Longest Common Subsequence state transitions.",
            },
          ],
          estimated_total_hours: 6.5,
        },
      });
    }

    const prompt = `You are Pulse AI, breaking down a high-level engineering or academic goal into discrete, actionable daily tasks for a CS student.
Goal: "${goalTitle}"

Provide 4 to 6 concrete, manageable task steps with realistic duration in minutes (between 30 and 120), suggested target day offset (e.g. 1 for tomorrow, 3 for 3 days later), appropriate category (one of: Java, DSA, MERN Stack, College, Projects, Personal, Health and Fitness, Other), and priority (low, medium, high, urgent).

Return ONLY valid JSON matching this schema:
{
  "goal_title": string,
  "strategy_summary": string,
  "tasks": [
    {
      "title": string,
      "category": string,
      "priority": "low" | "medium" | "high" | "urgent",
      "estimated_duration_minutes": number,
      "target_day_offset": number,
      "rationale": string
    }
  ],
  "estimated_total_hours": number
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
    const validated = AIGoalBreakdownResponseSchema.parse(parsed);

    return NextResponse.json({
      configured: true,
      breakdown: validated,
    });
  } catch (error: unknown) {
    console.error("AI Breakdown error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate goal breakdown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
