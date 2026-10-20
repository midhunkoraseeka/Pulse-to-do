"use client";

import { useState, useEffect, useCallback } from "react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { localStore } from "@/lib/storage/localStore";
import { User } from "@supabase/supabase-js";

const AUTH_NOT_CONFIGURED_MESSAGE =
  "Authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local and restart the dev server.";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // Nothing to load when there is no auth backend
  const [loading, setLoading] = useState(isSupabaseConfigured);

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
    } else {
      // No auth backend: never treat a locally stored user as signed in
      if (typeof window !== "undefined") {
        localStorage.removeItem("pulse_simulated_user");
      }
    }
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
        if (data?.url) {
          window.location.href = data.url;
        }
        return { data };
      }
    }

    throw new Error(AUTH_NOT_CONFIGURED_MESSAGE);
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
        if (data.user) {
          setUser(data.user);
          const profile = localStore.getProfile();
          const displayName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.display_name ||
            email.split("@")[0] ||
            profile.display_name;
          localStore.saveProfile({ ...profile, display_name: displayName });
        }
        return { data };
      }
    }

    throw new Error(AUTH_NOT_CONFIGURED_MESSAGE);
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
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                display_name: displayName,
                full_name: displayName,
              },
            },
          });
          if (error) throw error;
          if (data.user && data.session) {
            setUser(data.user);
            const profile = localStore.getProfile();
            localStore.saveProfile({ ...profile, display_name: displayName });
          }
          return { data };
        }
      }

      throw new Error(AUTH_NOT_CONFIGURED_MESSAGE);
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
    const profile = localStore.getProfile();
    localStore.saveProfile({ ...profile, display_name: "Developer" });
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
