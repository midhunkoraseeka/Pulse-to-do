"use client";

import React, { useState, useEffect } from "react";
import { formatEditorialDate } from "@/lib/dates/timezone";
import { localStore } from "@/lib/storage/localStore";
import { Plus, Bell, Search } from "lucide-react";

interface HeaderProps {
  onOpenAddTask: () => void;
  onSearchChange?: (query: string) => void;
}

export function Header({ onOpenAddTask, onSearchChange }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [profile, setProfile] = useState(() => localStore.getProfile());
  const [greeting, setGreeting] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [editorialDate, setEditorialDate] = useState("");

  useEffect(() => {
    setEditorialDate(formatEditorialDate());
    // Update live clock
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );

      const hour = now.getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    const handleProfileUpdate = () => {
      setProfile(localStore.getProfile());
    };
    window.addEventListener("pulse_profile_updated", handleProfileUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("pulse_profile_updated", handleProfileUpdate);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <header className="border-b border-[#232A21] bg-[#090B09] px-6 py-4 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Editorial Date & Greeting */}
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#92988D]">
              {editorialDate || "TODAY"}
            </span>
            <span className="text-[#384534]">•</span>
            <span className="text-xs font-mono text-[#C6FF5E] font-medium tracking-wider">
              {currentTime || "--:--:--"}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EC] mt-0.5">
            {greeting}, <span className="text-[#F1F3EC]">{profile.display_name}</span>
          </h1>
        </div>

        {/* Right: Search, Notification Bell & Primary Action Button */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden sm:block w-52 md:w-64">
            <Search className="w-4 h-4 text-[#5E645A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks (Cmd+K)..."
              value={searchVal}
              onChange={handleSearch}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#111410] border border-[#232A21] text-[#F1F3EC] placeholder-[#5E645A] focus:outline-none focus:border-[#C6FF5E] transition-colors"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="p-2 rounded-lg bg-[#111410] border border-[#232A21] text-[#92988D] hover:text-[#F1F3EC] hover:border-[#384534] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C6FF5E]" />
          </button>

          {/* New Task Action Button */}
          <button
            type="button"
            onClick={onOpenAddTask}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold tracking-wider uppercase hover:bg-[#b5f547] active:scale-95 transition-all shadow-[0_0_15px_rgba(198,255,94,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
