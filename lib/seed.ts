import { supabase } from "./supabase";

export async function seedUserData(userId: string) {
  try {
    // Check if the user already has any tasks to avoid duplicate seeding
    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) throw countError;

    // Only seed if they have 0 tasks
    if (count !== 0) return false;

    const now = new Date();

    // Helper to calculate offset dates
    const offsetDate = (hours: number) => {
      const d = new Date(now);
      d.setHours(d.getHours() + hours);
      return d.toISOString();
    };

    const offsetDay = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0];
    };

    // 1. Seed Tasks
    const sampleTasks = [
      {
        user_id: userId,
        title: "⚡ Set up ProTrack profile",
        description: "Welcome to ProTrack! This task is already completed to get your streak started.",
        deadline: offsetDate(-2), // 2 hours ago
        estimated_hours: 0.5,
        energy_level: "low",
        status: "completed",
        priority: 1,
        category: "general",
      },
      {
        user_id: userId,
        title: "📅 Review project priorities with AI",
        description: "Generate your first AI Insight plan on the dashboard to review deadline risks.",
        deadline: offsetDate(3), // 3 hours from now
        estimated_hours: 1,
        energy_level: "medium",
        status: "in-progress",
        priority: 4,
        category: "work",
      },
      {
        user_id: userId,
        title: "🏃‍♂️ Daily 30-minute cardio workout",
        description: "Consistency is key for physical and mental energy. Keep it brisk!",
        deadline: offsetDate(8), // 8 hours from now
        estimated_hours: 0.5,
        energy_level: "high",
        status: "pending",
        priority: 3,
        category: "health",
      },
      {
        user_id: userId,
        title: "📘 Study deep learning concepts",
        description: "Read Chapter 4 of the Neural Networks textbook and summarize core layers.",
        deadline: offsetDate(26), // 26 hours from now
        estimated_hours: 2,
        energy_level: "high",
        status: "pending",
        priority: 3,
        category: "study",
      },
      {
        user_id: userId,
        title: "💡 Brainstorm side project features",
        description: "Draft a mock sketch of potential user interfaces for the new landing page.",
        deadline: offsetDate(50), // ~2 days from now
        estimated_hours: 1.5,
        energy_level: "medium",
        status: "pending",
        priority: 2,
        category: "personal",
      },
      {
        user_id: userId,
        title: "💸 File monthly utility bills",
        description: "Pay electric and internet bills before automatic processing.",
        deadline: offsetDate(96), // 4 days from now
        estimated_hours: 0.5,
        energy_level: "low",
        status: "pending",
        priority: 5,
        category: "finance",
      },
    ];

    const { error: taskError } = await supabase.from("tasks").insert(sampleTasks);
    if (taskError) throw taskError;

    // 2. Seed Goals
    const sampleGoals = [
      {
        user_id: userId,
        title: "Master Time Management",
        description: "Complete daily AI planning sessions and finish high-priority tasks before deadline alerts trigger.",
        target_date: offsetDay(30),
        progress: 30,
        status: "active",
      },
      {
        user_id: userId,
        title: "Read 5 Industry Books",
        description: "Focus on productivity, software architecture, and habit design books.",
        target_date: offsetDay(90),
        progress: 10,
        status: "active",
      },
    ];

    const { error: goalError } = await supabase.from("goals").insert(sampleGoals);
    if (goalError) throw goalError;

    // 3. Seed Habits
    const sampleHabits = [
      {
        user_id: userId,
        title: "💧 Drink 3L Water",
        frequency: "daily",
        streak: 3,
        last_completed: offsetDay(-1),
      },
      {
        user_id: userId,
        title: "🧘 Plan tomorrow tonight",
        frequency: "daily",
        streak: 5,
        last_completed: offsetDay(-1),
      },
      {
        user_id: userId,
        title: "📖 Read 15 pages",
        frequency: "daily",
        streak: 0,
        last_completed: null,
      },
    ];

    const { error: habitError } = await supabase.from("habits").insert(sampleHabits);
    if (habitError) throw habitError;

    return true;
  } catch (error) {
    console.error("Failed to seed initial user data:", error);
    return false;
  }
}
