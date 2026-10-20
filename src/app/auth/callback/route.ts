import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  // Only allow same-site relative paths to avoid open redirects
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  // Handle errors sent back by OAuth provider
  if (error) {
    console.error("OAuth error received at callback:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Handle authorization code exchange
  if (code) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!exchangeError) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error("Auth callback code exchange error:", exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // No code (or auth not configured): nothing to sign in with
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Sign-in could not be completed. Please try again.")}`
  );
}
