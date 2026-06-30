import { NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/google-calendar";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("state");

    if (!code || !userId) {
      return NextResponse.redirect(new URL("/dashboard/calendar?error=missing_params", req.url));
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens using service role (server-side)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from("google_tokens").upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });

    return NextResponse.redirect(new URL("/dashboard/calendar?google=connected", req.url));
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(new URL("/dashboard/calendar?error=auth_failed", req.url));
  }
}
