"use client";

import { useState, useEffect, useCallback } from "react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { localStore } from "@/lib/storage/localStore";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and listen to auth state changes
  useEffect(() => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            setUser(user);
            // Sync user display name to profile
            const profile = localStore.getProfile();
            const displayName =
              user.user_metadata?.full_name ||
              user.user_metadata?.display_name ||
              user.email?.split("@")[0] ||
              profile.display_name;
            localStore.saveProfile({ ...profile, display_name: displayName });
          }
          setLoading(false);
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          const sessionUser = session?.user ?? null;
          setUser(sessionUser);
          if (sessionUser) {
            const profile = localStore.getProfile();
            const displayName =
              sessionUser.user_metadata?.full_name ||
              sessionUser.user_metadata?.display_name ||
              sessionUser.email?.split("@")[0] ||
              profile.display_name;
            localStore.saveProfile({ ...profile, display_name: displayName });
          }
        });

        return () => subscription.unsubscribe();
      }
    }

    // Local fallback check
    if (typeof window !== "undefined") {
      const localAuth = localStorage.getItem("pulse_simulated_user");
      if (localAuth) {
        try {
          setUser(JSON.parse(localAuth));
        } catch {
          // ignore
        }
      }
    }
    setLoading(false);
  }, []);

  // Sign In with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });
        if (error) {
          throw error;
        }
        return { data };
      }
    }

    // Local simulated Google Sign In fallback when keys are not yet configured
    const simulatedGoogleUser = {
      id: "google_dev_user",
      email: "alex.rivera.dev@gmail.com",
      user_metadata: {
        full_name: "Alex Rivera",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        provider: "google",
      },
      app_metadata: { provider: "google" },
      created_at: new Date().toISOString(),
    } as unknown as User;

    localStorage.setItem("pulse_simulated_user", JSON.stringify(simulatedGoogleUser));
    setUser(simulatedGoogleUser);
    const profile = localStore.getProfile();
    localStore.saveProfile({ ...profile, display_name: "Alex Rivera" });
    return { data: { user: simulatedGoogleUser } };
  }, []);

  // Sign In with Email & Password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return { data };
      }
    }

    // Local simulated email sign in
    const simulatedUser = {
      id: `local_user_${Date.now()}`,
      email,
      user_metadata: {
        full_name: email.split("@")[0],
        provider: "email",
      },
      app_metadata: { provider: "email" },
      created_at: new Date().toISOString(),
    } as unknown as User;

    localStorage.setItem("pulse_simulated_user", JSON.stringify(simulatedUser));
    setUser(simulatedUser);
    const profile = localStore.getProfile();
    localStore.saveProfile({ ...profile, display_name: email.split("@")[0] });
    return { data: { user: simulatedUser } };
  }, []);

  // Sign Up with Email & Password
  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName,
                full_name: displayName,
              },
            },
          });
          if (error) throw error;
          return { data };
        }
      }

      // Local simulated signup
      const simulatedUser = {
        id: `local_user_${Date.now()}`,
        email,
        user_metadata: {
          full_name: displayName,
          display_name: displayName,
          provider: "email",
        },
        app_metadata: { provider: "email" },
        created_at: new Date().toISOString(),
      } as unknown as User;

      localStorage.setItem("pulse_simulated_user", JSON.stringify(simulatedUser));
      setUser(simulatedUser);
      const profile = localStore.getProfile();
      localStore.saveProfile({ ...profile, display_name: displayName });
      return { data: { user: simulatedUser } };
    },
    []
  );

  // Sign Out
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    localStorage.removeItem("pulse_simulated_user");
    setUser(null);
  }, []);

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isConfigured: isSupabaseConfigured,
  };
}
