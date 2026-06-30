import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-calendar";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Google Calendar not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file." },
        { status: 503 }
      );
    }

    const authUrl = getAuthUrl() + `&state=${userId}`;
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
  }
}
