import { getRecommendations } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tasks, completedCount, overdueCount, streakDays } = await req.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Please provide task data for recommendations" },
        { status: 400 }
      );
    }

    const result = await getRecommendations(
      tasks,
      completedCount || 0,
      overdueCount || 0,
      streakDays || 0
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommendation error:", error);
    const message = error instanceof Error ? error.message : "Recommendations failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
