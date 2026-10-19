import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { AIProductivityInsightResponseSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { progressPercentage, completedTasks, totalTasks, overdueTasks, categorySummary } = body;

    const ai = getGeminiClient();

    if (!ai || !isGeminiConfigured) {
      const score = Math.max(10, Math.min(100, Math.round(progressPercentage * 0.8 + 15)));
      return NextResponse.json({
        configured: false,
        notice: "Gemini API key not configured. Displaying algorithmic analytical insights.",
        insights: {
          completion_rate_assessment: `You have completed ${completedTasks} of ${totalTasks} scheduled tasks (${progressPercentage}%), demonstrating ${
            progressPercentage >= 70 ? "commanding daily execution" : "steady ongoing momentum"
          }.`,
          highlighted_accomplishment:
            completedTasks > 0
              ? `Successfully resolved core technical milestones in your scheduled pipeline.`
              : `Prepared an organized operational task queue for today's engineering sprint.`,
          identified_bottlenecks:
            overdueTasks > 0
              ? [`${overdueTasks} pending item(s) from past cycles need priority clearance.`]
              : ["Task durations should be monitored against estimated completion windows."],
          category_distribution_notes:
            "Consistent focus across DSA, Java, and systems architecture builds lasting technical leverage.",
          momentum_score: score,
          recommendations_for_tomorrow: [
            "Complete your highest complexity DSA problem before checking social media or email.",
            "Schedule a dedicated 45-minute deep focus block for semester project architecture.",
            "Perform an end-of-day 5-minute task review to seed tomorrow's Living Progress Field.",
          ],
        },
      });
    }

    const prompt = `You are Pulse AI, analyzing real verified productivity analytics for a CS student.
Observed Data:
- Completion Percentage: ${progressPercentage}%
- Completed Tasks: ${completedTasks}
- Total Planned Tasks: ${totalTasks}
- Overdue Tasks: ${overdueTasks}
- Category Breakdown: ${JSON.stringify(categorySummary || {})}

Return an objective, inspiring, non-judgmental productivity insight matching this JSON schema:
{
  "completion_rate_assessment": string,
  "highlighted_accomplishment": string,
  "identified_bottlenecks": [string],
  "category_distribution_notes": string,
  "momentum_score": number (1-100),
  "recommendations_for_tomorrow": [string]
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
    const validated = AIProductivityInsightResponseSchema.parse(parsed);

    return NextResponse.json({
      configured: true,
      insights: validated,
    });
  } catch (error: unknown) {
    console.error("AI Insights error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate AI insights";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
