"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import StatsCard from "@/components/StatsCard";
import UrgencyTimeline from "@/components/UrgencyTimeline";
import AIInsightPanel from "@/components/AIInsightPanel";
import EmptyState from "@/components/EmptyState";
import { SkeletonStats, SkeletonCard } from "@/components/LoadingSpinner";
import type { Task } from "@/components/TaskCard";
import type { AnalysisResult } from "@/lib/ai";
import { getGreeting } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { seedUserData } from "@/lib/seed";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Flame,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    
    // Seed initial data for a first-time user
    const seeded = await seedUserData(user.id);
    
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("deadline", { ascending: true });

    if (error) {
      showToast("Failed to load tasks", "error");
    } else {
      setTasks(data || []);
      if (seeded) {
        showToast("Welcome to ProTrack! Seeded template tasks for you.", "success");
      }
    }
    setLoading(false);
  };

  const analyze = async () => {
    if (tasks.length === 0) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAiResult(data);
      showToast("AI analysis complete!", "success");
    } catch {
      showToast("AI analysis failed. Try again.", "error");
    }
    setAiLoading(false);
  };

  const totalTasks = tasks.length;
  const completedToday = tasks.filter((t) => {
    if (t.status !== "completed") return false;
    const today = new Date().toDateString();
    return new Date(t.created_at).toDateString() === today;
  }).length;
  const overdue = tasks.filter((t) => {
    if (t.status === "completed" || !t.deadline) return false;
    return new Date(t.deadline) < new Date();
  }).length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;

  const greeting = getGreeting();
  const firstName = user?.email?.split("@")[0] || "there";

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header animate-slide-up">
        <h1 className="page-title">{greeting}, {firstName} 👋</h1>
        <p className="page-subtitle">
          Here&apos;s your productivity snapshot for today
        </p>
      </div>

      {/* Stats Row */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid-stats animate-slide-up stagger-1" style={{ marginBottom: "1.5rem" }}>
          <StatsCard
            label="Total Tasks"
            value={totalTasks}
            icon={<CheckSquare size={20} />}
            color="var(--color-primary-light)"
          />
          <StatsCard
            label="In Progress"
            value={inProgress}
            icon={<Flame size={20} />}
            color="var(--color-accent)"
          />
          <StatsCard
            label="Overdue"
            value={overdue}
            icon={<AlertTriangle size={20} />}
            color="var(--color-danger)"
          />
          <StatsCard
            label="Done Today"
            value={completedToday}
            icon={<TrendingUp size={20} />}
            color="var(--color-success)"
          />
        </div>
      )}

      {/* Main content area */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : tasks.length === 0 ? (
            <div className="card-static">
              <EmptyState
                icon={<LayoutDashboard size={32} />}
                title="No tasks yet"
                description="Create your first task to get started with ProTrack's AI-powered productivity."
                action={
                  <Link href="/dashboard/tasks" className="btn btn-primary">
                    <CheckSquare size={18} />
                    Add Your First Task
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              {/* Urgency Timeline */}
              <div className="animate-slide-up stagger-2">
                <UrgencyTimeline tasks={tasks} />
              </div>

              {/* Recent Tasks */}
              <div className="card-static animate-slide-up stagger-3" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Clock size={18} color="var(--color-primary-light)" />
                    Recent Tasks
                  </h3>
                  <Link
                    href="/dashboard/tasks"
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-primary-light)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    View All →
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.625rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            textDecoration: task.status === "completed" ? "line-through" : "none",
                            color: task.status === "completed" ? "var(--text-muted)" : "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {task.title}
                        </p>
                      </div>
                      <span
                        className={`badge ${task.status === "completed" ? "badge-success" : task.status === "in-progress" ? "badge-primary" : "badge-muted"}`}
                        style={{ marginLeft: "0.75rem", fontSize: "0.6875rem" }}
                      >
                        {task.status === "completed" ? "Done" : task.status === "in-progress" ? "Active" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right column — AI Panel */}
        <div className="animate-slide-right stagger-2">
          <AIInsightPanel
            result={aiResult}
            loading={aiLoading}
            onAnalyze={analyze}
            taskCount={tasks.filter((t) => t.status !== "completed").length}
          />
        </div>
      </div>
    </div>
  );
}