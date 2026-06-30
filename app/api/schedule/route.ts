import { generateSchedule } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tasks, currentHour } = await req.json();

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one task to schedule" },
        { status: 400 }
      );
    }

    const hour = typeof currentHour === "number" ? currentHour : new Date().getHours();
    const result = await generateSchedule(tasks, hour);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Schedule generation error:", error);
    const message = error instanceof Error ? error.message : "Schedule generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
