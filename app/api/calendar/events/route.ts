import { NextResponse } from "next/server";
import { fetchCalendarEvents, createCalendarEvent } from "@/lib/google-calendar";
import { createClient } from "@supabase/supabase-js";

async function getTokens(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data;
}

// GET — fetch Google Calendar events
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const tokens = await getTokens(userId);
    if (!tokens) {
      return NextResponse.json({ connected: false, events: [] });
    }

    const events = await fetchCalendarEvents(
      tokens.access_token,
      tokens.refresh_token,
      searchParams.get("timeMin") || undefined,
      searchParams.get("timeMax") || undefined
    );

    return NextResponse.json({ connected: true, events });
  } catch (error) {
    console.error("Calendar events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST — sync a task to Google Calendar
export async function POST(req: Request) {
  try {
    const { userId, title, deadline, description } = await req.json();

    if (!userId || !title || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tokens = await getTokens(userId);
    if (!tokens) {
      return NextResponse.json({ error: "Google Calendar not connected" }, { status: 401 });
    }

    const event = await createCalendarEvent(
      tokens.access_token,
      tokens.refresh_token,
      title,
      deadline,
      description
    );

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json({ error: "Failed to sync to calendar" }, { status: 500 });
  }
}
