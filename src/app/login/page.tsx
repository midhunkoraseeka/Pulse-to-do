"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        setErrorMsg(decodeURIComponent(urlError));
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      // Redirects the browser to Google; the session is created in /auth/callback
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Google authentication failed";
      setErrorMsg(msg);
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B09] flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0E110E] border border-[#232A21] space-y-6 shadow-2xl">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#111410] border border-[#232A21] flex items-center justify-center mb-3">
            <span className="w-3 h-3 rounded-sm bg-[#C6FF5E] shadow-[0_0_10px_#C6FF5E]" />
          </div>
          <h1 className="font-mono text-xl font-black tracking-widest text-[#F1F3EC]">
            PULSE
          </h1>
          <p className="text-xs font-mono text-[#92988D] mt-1">Make every day count</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-[rgba(255,94,94,0.1)] border border-[rgba(255,94,94,0.3)] text-xs text-[#FF5E5E] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Google One-Click Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-2.5 px-4 rounded-xl bg-[#171C16] border border-[#384534] hover:border-[#C6FF5E] text-xs font-mono text-[#F1F3EC] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {googleLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-[#C6FF5E] border-t-transparent animate-spin" />
          ) : (
            <GoogleIcon className="w-4 h-4" />
          )}
          <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#232A21]" />
          <span className="text-[10px] font-mono text-[#5E645A] uppercase tracking-wider">
            Or with email
          </span>
          <div className="flex-1 h-px bg-[#232A21]" />
        </div>

        {/* 2. Normal Email & Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5E645A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@university.edu"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#92988D] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5E645A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#111410] border border-[#232A21] text-xs text-[#F1F3EC] focus:outline-none focus:border-[#C6FF5E] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-2.5 rounded-xl bg-[#C6FF5E] text-[#090B09] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b5f547] active:scale-95 transition-all shadow-[0_0_15px_rgba(198,255,94,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In with Email"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-xs font-mono text-[#92988D] pt-4 border-t border-[#1C221A]">
          <span>New to Pulse?</span>
          <Link href="/signup" className="text-[#C6FF5E] hover:underline font-bold">
            Create Account
          </Link>
        </div>

        {/* Local preview is only available when no auth backend is configured */}
        {!isConfigured && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-[11px] font-mono text-[#5E645A] hover:text-[#92988D] underline"
            >
              Explore workspace in local preview mode →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
