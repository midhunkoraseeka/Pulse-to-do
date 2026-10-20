"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Target,
  Settings,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      {/* Desktop Editorial Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#232A21] bg-[#090B09] h-screen sticky top-0 z-40 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#232A21]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#111410] border border-[#232A21] flex items-center justify-center group-hover:border-[#C6FF5E] transition-colors">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#C6FF5E] shadow-[0_0_8px_#C6FF5E]" />
            </div>
            <div>
              <div className="font-mono text-base font-black tracking-widest text-[#F1F3EC] flex items-center gap-1.5">
                PULSE
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#171C16] border border-[#232A21] text-[#C6FF5E]">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#92988D] tracking-wider uppercase">
                Make every day count
              </p>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#5E645A]">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-[#171C16] text-[#F1F3EC] border border-[#384534]"
                    : "text-[#92988D] hover:text-[#F1F3EC] hover:bg-[#111410]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-[#C6FF5E]" : "text-[#5E645A] group-hover:text-[#F1F3EC]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[rgba(198,255,94,0.1)] text-[#C6FF5E] border border-[rgba(198,255,94,0.2)]">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF5E] shadow-[0_0_6px_#C6FF5E]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Focus Mode Quick Link / Status Footer */}
        <div className="p-4 border-t border-[#232A21] bg-[#090B09] space-y-2">
          <div className="p-3 rounded-xl bg-[#111410] border border-[#232A21] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#92988D] uppercase tracking-wider">
                System Status
              </div>
              <div className="text-xs font-semibold text-[#F1F3EC] flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#C6FF5E] animate-pulse" />
                Living Engine Active
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-[#92988D] hover:text-[#FF5E5E] bg-[#111410] border border-[#232A21] hover:border-[rgba(255,94,94,0.3)] hover:bg-[rgba(255,94,94,0.08)] transition-all active:scale-95 disabled:opacity-50"
            id="sidebar-signout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#090B09] border-b border-[#232A21] sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#111410] border border-[#232A21] flex items-center justify-center">
            <span className="w-2 h-2 rounded-sm bg-[#C6FF5E]" />
          </div>
          <span className="font-mono text-sm font-black tracking-widest text-[#F1F3EC]">
            PULSE
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-[#171C16] border border-[#232A21] text-[#C6FF5E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF5E] animate-pulse" />
            <span>v2.0</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="p-1.5 rounded-lg bg-[#111410] border border-[#232A21] text-[#92988D] hover:text-[#FF5E5E] hover:border-[rgba(255,94,94,0.3)] transition-colors"
            title="Sign Out"
            id="mobile-signout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090B09] border-t border-[#232A21] px-2 py-1.5 flex items-center justify-around select-none backdrop-blur-md"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-mono transition-colors ${
                isActive ? "text-[#C6FF5E]" : "text-[#92988D] hover:text-[#F1F3EC]"
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
