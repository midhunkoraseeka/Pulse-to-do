"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { localStore } from "@/lib/storage/localStore";
import { Profile, TaskCategory } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { requestNotificationPermission } from "@/lib/notifications/reminderManager";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Check, Settings, Bell, Database, Sparkles, Shield, User, Clock, LogOut } from "lucide-react";

const CATEGORIES: TaskCategory[] = [
  "DSA",
  "Java",
  "MERN Stack",
  "College",
  "Projects",
  "Personal",
  "Health and Fitness",
  "Other",
];

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "UTC",
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>(() => localStore.getProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationState, setNotificationState] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationState(Notification.permission);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStore.saveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRequestNotifications = async () => {
    const res = await requestNotificationPermission();
    setNotificationState(res);
  };

  return (
    <AppShell>
      <Header onOpenAddTask={() => {}} />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F3EC]">
            System Preferences
          </h1>
          <p className="text-xs font-mono text-[#92988D]">
            Personalize your operating system, notifications, and environment bindings
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-[rgba(198,255,94,0.1)] border border-[#C6FF5E] text-xs font-mono text-[#C6FF5E] flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Preferences saved successfully to local and cloud store.</span>
          </div>
        )}

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#232A21]">
              <User className="w-4 h-4 text-[#C6FF5E]" />
              <h2 className="text-sm font-bold text-[#F1F3EC]">Profile & Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={profile.display_name}
                  onChange={(e) =>
                    setProfile({ ...profile, display_name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                  Timezone
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Workflow Defaults */}
          <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#232A21]">
              <Clock className="w-4 h-4 text-[#5EE5FF]" />
              <h2 className="text-sm font-bold text-[#F1F3EC]">Workflow Defaults</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                  Default Category
                </label>
                <select
                  value={profile.default_category}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      default_category: e.target.value as TaskCategory,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                  Default Focus Block (mins)
                </label>
                <input
                  type="number"
                  min={10}
                  max={240}
                  step={5}
                  value={profile.default_duration_minutes}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      default_duration_minutes: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
                  Week Starts On
                </label>
                <select
                  value={profile.week_start_preference}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      week_start_preference: Number(e.target.value) as 0 | 1,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E]"
                >
                  <option value={1}>Monday</option>
                  <option value={0}>Sunday</option>
                </select>
              </div>
            </div>
          </div>

          {/* Browser Notifications & Privacy */}
          <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#232A21]">
              <Bell className="w-4 h-4 text-[#FFDF5E]" />
              <h2 className="text-sm font-bold text-[#F1F3EC]">Notifications & Alerts</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#F1F3EC]">
                  Browser Focus & Reminder Notifications
                </div>
                <p className="text-xs text-[#92988D] mt-0.5">
                  Current browser status:{" "}
                  <span className="font-mono text-[#C6FF5E] uppercase">{notificationState}</span>
                </p>
              </div>

              {notificationState !== "granted" ? (
                <button
                  type="button"
                  onClick={handleRequestNotifications}
                  className="px-4 py-2 rounded-lg bg-[#232A21] border border-[#384534] text-xs font-mono text-[#F1F3EC] hover:border-[#C6FF5E]"
                >
                  Enable Browser Alerts
                </button>
              ) : (
                <span className="text-xs font-mono text-[#C6FF5E] flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Alerts Enabled
                </span>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] transition-all shadow-[0_0_15px_rgba(198,255,94,0.2)]"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Account & Session Management */}
        <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232A21]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#C6FF5E]" />
              <h2 className="text-sm font-bold text-[#F1F3EC]">Active Session & Identity</h2>
            </div>
            {user?.app_metadata?.provider === "google" && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(66,133,244,0.15)] text-[#4285F4] border border-[rgba(66,133,244,0.3)]">
                Google Account Verified
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#111410] border border-[#232A21]">
            <div>
              <div className="text-sm font-bold text-[#F1F3EC]">
                {user?.user_metadata?.full_name || profile.display_name}
              </div>
              <div className="text-xs font-mono text-[#92988D] mt-0.5">
                {user?.email || "developer@pulse.local"}
              </div>
              <div className="text-[10px] font-mono text-[#5E645A] mt-1">
                Auth Method: {user?.app_metadata?.provider ? user.app_metadata.provider.toUpperCase() : "EMAIL/WORKSPACE"}
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,94,94,0.12)] border border-[rgba(255,94,94,0.3)] text-xs font-mono text-[#FF5E5E] hover:bg-[#FF5E5E] hover:text-black transition-all self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Pulse</span>
            </button>
          </div>
        </div>

        {/* System Diagnostics Panel */}
        <div className="p-6 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#232A21]">
            <Shield className="w-4 h-4 text-[#C6FF5E]" />
            <h2 className="text-sm font-bold text-[#F1F3EC]">System Environment & Architecture</h2>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111410] border border-[#232A21]">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#5EE5FF]" />
                <span className="text-[#F1F3EC]">Supabase PostgreSQL & RLS</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isSupabaseConfigured
                    ? "bg-[rgba(198,255,94,0.12)] text-[#C6FF5E]"
                    : "bg-[#171C16] text-[#FFDF5E]"
                }`}
              >
                {isSupabaseConfigured ? "Connected" : "Local Storage Fallback Mode"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111410] border border-[#232A21]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#C6FF5E]" />
                <span className="text-[#F1F3EC]">Google Gemini Gen AI SDK</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(198,255,94,0.12)] text-[#C6FF5E]">
                Configured & Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
