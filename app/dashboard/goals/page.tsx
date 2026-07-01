"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import GoalCard, { type Goal } from "@/components/GoalCard";
import HabitTracker, { type Habit } from "@/components/HabitTracker";
import EmptyState from "@/components/EmptyState";
import { PageLoader } from "@/components/LoadingSpinner";
import { Target, Flame, Plus, X } from "lucide-react";

type Tab = "goals" | "habits";

export default function GoalsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Goal form
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [goalDate, setGoalDate] = useState("");

  // Habit form
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");
  const [habitFreq, setHabitFreq] = useState("daily");

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchHabits();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      showToast(`Failed to load goals: ${error.message} (${error.code})`, "error");
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const fetchHabits = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      showToast(`Failed to load habits: ${error.message} (${error.code})`, "error");
    } else {
      setHabits(data || []);
    }
    setLoading(false);
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !goalTitle.trim()) return;
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: goalTitle,
      description: goalDesc,
      target_date: goalDate || null,
    });
    if (error) showToast("Failed to add goal", "error");
    else {
      showToast("Goal added!", "success");
      setGoalTitle(""); setGoalDesc(""); setGoalDate("");
      setShowGoalForm(false);
      fetchGoals();
    }
  };

  const updateGoalProgress = async (id: string, progress: number) => {
    const status = progress >= 100 ? "completed" : "active";
    const { error } = await supabase.from("goals").update({ progress, status }).eq("id", id);
    if (error) showToast("Failed to update", "error");
    else {
      if (progress >= 100) showToast("Goal completed! 🎉", "success");
      setGoals((prev) => prev.map((g) => g.id === id ? { ...g, progress, status } : g));
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) showToast("Failed to delete", "error");
    else {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      showToast("Goal deleted", "info");
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !habitTitle.trim()) return;
    const { error } = await supabase.from("habits").insert({
      user_id: user.id,
      title: habitTitle,
      frequency: habitFreq,
    });
    if (error) showToast("Failed to add habit", "error");
    else {
      showToast("Habit added!", "success");
      setHabitTitle(""); setHabitFreq("daily");
      setShowHabitForm(false);
      fetchHabits();
    }
  };

  const completeHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const today = new Date().toISOString().split("T")[0];

    // Insert log
    const { error: logError } = await supabase.from("habit_logs").insert({
      habit_id: id,
      completed_at: today,
    });
    if (logError) {
      showToast("Already completed today", "warning");
      return;
    }

    // Update streak
    const newStreak = habit.streak + 1;
    await supabase.from("habits").update({
      streak: newStreak,
      last_completed: today,
    }).eq("id", id);

    setHabits((prev) =>
      prev.map((h) => h.id === id ? { ...h, streak: newStreak, last_completed: today } : h)
    );
    showToast(`Streak: ${newStreak} days! 🔥`, "success");
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) showToast("Failed to delete", "error");
    else {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      showToast("Habit deleted", "info");
    }
  };

  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <div className="page-header animate-slide-up">
        <h1 className="page-title">Goals & Habits</h1>
        <p className="page-subtitle">
          {activeGoals} active goals · {completedGoals} completed · {totalStreak} total streak days
        </p>
      </div>

      {/* Tabs */}
      <div className="animate-slide-up stagger-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div className="tabs" style={{ margin: 0, width: "auto" }}>
          <button className={`tab ${activeTab === "goals" ? "active" : ""}`} onClick={() => setActiveTab("goals")}>
            <Target size={16} style={{ marginRight: "0.375rem", verticalAlign: "-2px", display: "inline" }} />
            Goals ({goals.length})
          </button>
          <button className={`tab ${activeTab === "habits" ? "active" : ""}`} onClick={() => setActiveTab("habits")}>
            <Flame size={16} style={{ marginRight: "0.375rem", verticalAlign: "-2px", display: "inline" }} />
            Habits ({habits.length})
          </button>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (activeTab === "goals") setShowGoalForm(!showGoalForm);
            else setShowHabitForm(!showHabitForm);
          }}
        >
          {(activeTab === "goals" ? showGoalForm : showHabitForm) ? <X size={16} /> : <Plus size={16} />}
          {(activeTab === "goals" ? showGoalForm : showHabitForm) ? "Close" : `Add ${activeTab === "goals" ? "Goal" : "Habit"}`}
        </button>
      </div>

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <>
          {/* Goal form */}
          {showGoalForm && (
            <div className="card-static animate-slide-down" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>New Goal</h3>
              <form onSubmit={addGoal} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input className="input" placeholder="Goal title" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} required />
                <textarea className="input" placeholder="Description (optional)" value={goalDesc} onChange={(e) => setGoalDesc(e.target.value)} rows={2} style={{ resize: "vertical", minHeight: "60px" }} />
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Target Date</label>
                  <input className="input" type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  <Plus size={18} />
                  Create Goal
                </button>
              </form>
            </div>
          )}

          {goals.length === 0 ? (
            <div className="card-static">
              <EmptyState
                icon={<Target size={32} />}
                title="No goals yet"
                description="Set your first goal and start tracking your progress"
                action={
                  <button className="btn btn-primary" onClick={() => setShowGoalForm(true)}>
                    <Plus size={18} />
                    Add Goal
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid-cards">
              {goals.map((goal, i) => (
                <div key={goal.id} className={`animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                  <GoalCard goal={goal} onUpdateProgress={updateGoalProgress} onDelete={deleteGoal} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Habits Tab */}
      {activeTab === "habits" && (
        <>
          {/* Habit form */}
          {showHabitForm && (
            <div className="card-static animate-slide-down" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>New Habit</h3>
              <form onSubmit={addHabit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input className="input" placeholder="Habit name (e.g., Read 30 minutes)" value={habitTitle} onChange={(e) => setHabitTitle(e.target.value)} required />
                <select className="input" value={habitFreq} onChange={(e) => setHabitFreq(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  <Plus size={18} />
                  Create Habit
                </button>
              </form>
            </div>
          )}

          {/* Streak banner */}
          {habits.length > 0 && totalStreak > 0 && (
            <div
              className="card-static animate-slide-up"
              style={{
                padding: "1.25rem",
                marginBottom: "1.5rem",
                background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))",
                border: "1px solid rgba(245,158,11,0.15)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>🔥</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-warning)" }}>
                {totalStreak} Day{totalStreak !== 1 ? "s" : ""} Total Streak
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Keep going — consistency is key!</p>
            </div>
          )}

          {habits.length === 0 ? (
            <div className="card-static">
              <EmptyState
                icon={<Flame size={32} />}
                title="No habits yet"
                description="Build daily or weekly habits to boost your productivity"
                action={
                  <button className="btn btn-primary" onClick={() => setShowHabitForm(true)}>
                    <Plus size={18} />
                    Add Habit
                  </button>
                }
              />
            </div>
          ) : (
            <div className="card-static animate-slide-up stagger-1" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem" }}>Today&apos;s Habits</h3>
              <HabitTracker habits={habits} onComplete={completeHabit} onDelete={deleteHabit} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
