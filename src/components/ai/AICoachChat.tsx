"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Bot, AlertCircle } from "lucide-react";
import { Task, DailyProgressCalculation } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AICoachChatProps {
  tasks: Task[];
  progress: DailyProgressCalculation;
}

const STARTER_PROMPTS = [
  "How should I structure my DSA prep today?",
  "Explain Java HashMap collision resolution and red-black tree threshold",
  "How to handle JWT refresh token rotation safely?",
  "Review my today's task queue for burnout risks",
];

export function AICoachChat({ tasks, progress }: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Welcome to Pulse AI. I'm your engineering coach and productivity architect.
You currently have **${tasks.length} total tasks** with **${progress.progressPercentage}% completed** today.

How can I help accelerate your learning or optimize your deep work blocks today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            progressPercentage: progress.progressPercentage,
            completedTasks: progress.completedTasks,
            totalTasks: progress.totalTasks,
            overdueTasks: progress.overdueTasks,
            activeTasks: tasks.map((t) => ({
              title: t.title,
              category: t.category,
              priority: t.priority,
              status: t.status,
            })),
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: `Error: ${data.error || "Failed to reach AI service."}` },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Network error communicating with AI service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] max-h-[80vh] rounded-2xl bg-[#0E110E] border border-[#232A21] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#232A21] bg-[#090B09]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#171C16] border border-[#384534] flex items-center justify-center text-[#C6FF5E]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#F1F3EC] flex items-center gap-2">
              Pulse AI Coach
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[rgba(198,255,94,0.1)] text-[#C6FF5E] border border-[rgba(198,255,94,0.2)]">
                Gemini
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#92988D]">Technical mentor & study strategist</p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                msg.role === "user"
                  ? "bg-[#232A21] text-[#F1F3EC]"
                  : "bg-[#171C16] border border-[#384534] text-[#C6FF5E]"
              }`}
            >
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#1C231A] text-[#F1F3EC] border border-[#384534]"
                  : "bg-[#111410] text-[#D8DCD3] border border-[#232A21] whitespace-pre-line"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#92988D] pl-10">
            <span className="w-2 h-2 rounded-full bg-[#C6FF5E] animate-ping" />
            <span>Thinking through the solution...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-[#1C221A] bg-[#090B09] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {STARTER_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-mono text-[#92988D] bg-[#111410] border border-[#232A21] hover:border-[#C6FF5E] hover:text-[#F1F3EC] px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-[#232A21] bg-[#090B09] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your tasks, DSA algorithms, or study plan..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] placeholder-[#5E645A] focus:outline-none focus:border-[#C6FF5E] transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-[#C6FF5E] text-[#090B09] hover:bg-[#b5f547] active:scale-95 disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
