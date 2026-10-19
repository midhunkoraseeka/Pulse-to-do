import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    const userMessage = messages?.[messages.length - 1]?.content || "";

    const ai = getGeminiClient();

    if (!ai || !isGeminiConfigured) {
      let reply = `I'm currently in local preview mode since a Gemini API key is not yet set in .env.local. However, based on your current task stream:
- Focus on your high-priority DSA and Java tasks during your peak energy hours.
- Remember to take a 5-minute break after every 25 minutes of continuous code execution.
- If you need to break down a big milestone, use the Goal Breakdown tool in the Goals tab!

To activate full live AI reasoning, add your GEMINI_API_KEY from Google AI Studio.`;

      if (userMessage.toLowerCase().includes("dsa") || userMessage.toLowerCase().includes("leetcode")) {
        reply = `For DSA interview preparation, prioritize patterns over problem count. Master:
1. Two Pointers & Sliding Window (O(N) time, O(1) space)
2. Monotonic Stack (Next Greater Element problems)
3. Breadth-First Search for shortest paths in unweighted graphs
4. Dynamic Programming state formulation (identify subproblems before writing memo tables).

Keep your focus timer running for 45 minutes on one problem without looking at solutions!`;
      } else if (userMessage.toLowerCase().includes("java")) {
        reply = `For Java mastery:
- Internal workings of HashMap: hash code collisions, linked list to red-black tree transition (threshold 8).
- Concurrency: Understand CAS (Compare-And-Swap), volatile keyword visibility guarantees, and ReentrantLock vs synchronized blocks.
- Garbage collection: G1GC vs ZGC phases and generational hypothesis.`;
      }

      return NextResponse.json({
        configured: false,
        message: reply,
      });
    }

    const systemInstruction = `You are Pulse AI Coach, an elite engineering director and personal productivity mentor.
User Context:
${JSON.stringify(context || {})}

Guidelines:
- Keep answers concise, highly technical, encouraging, and actionable.
- Help the user prioritize their real tasks, solve technical roadblocks, or structure their study schedule.
- Do not invent data you do not have.
- Use clean Markdown formatting.`;

    const contents = [
      { role: "user", parts: [{ text: `${systemInstruction}\n\nUser Question: ${userMessage}` }] },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    });

    return NextResponse.json({
      configured: true,
      message: response.text || "No response received.",
    });
  } catch (error: unknown) {
    console.error("AI Chat error:", error);
    const msg = error instanceof Error ? error.message : "Failed to chat with AI";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
