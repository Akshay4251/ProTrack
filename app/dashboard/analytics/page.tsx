"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { DonutChart, BarChart, MiniBarChart } from "@/components/ProductivityChart";
import StatsCard from "@/components/StatsCard";
import { PageLoader } from "@/components/LoadingSpinner";
import type { Task } from "@/components/TaskCard";
import { getCategoryColor } from "@/lib/utils";
import {
  BarChart3,
  CheckCircle,
  Clock,
  Target,
  Flame,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiRecs, setAiRecs] = useState<{ insights: string[]; improvements: string[]; motivational_tip: string } | null>(null);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);
    if (error) showToast(`Failed to load tasks: ${error.message} (${error.code})`, "error");
    else setTasks(data || []);
    setLoading(false);
  };

  const fetchRecommendations = async () => {
    setRecsLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          completedCount: stats.completed,
          overdueCount: stats.overdue,
          streakDays: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load recommendations");
      }
      setAiRecs(data);
    } catch (err: any) {
      showToast(`Failed to get recommendations: ${err.message}`, "error");
    }
    setRecsLoading(false);
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const overdue = tasks.filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date()).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, inProgress, overdue, completionRate };
  }, [tasks]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value, color: getCategoryColor(label) }))
      .sort((a, b) => b.value - a.value);
  }, [tasks]);

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = new Array(7).fill(0);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);

    tasks.forEach((t) => {
      if (t.status !== "completed") return;
      const created = new Date(t.created_at);
      const diffDays = Math.floor((created.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) counts[diffDays]++;
    });

    return { values: counts, labels: days };
  }, [tasks]);

  const priorityBreakdown = useMemo(() => {
    const groups: Record<string, number> = { "P1-Low": 0, "P2": 0, "P3-Med": 0, "P4": 0, "P5-Crit": 0 };
    const keys = ["P1-Low", "P2", "P3-Med", "P4", "P5-Crit"];
    const colors = ["var(--text-muted)", "var(--color-info)", "var(--color-warning)", "var(--color-warning)", "var(--color-danger)"];

    tasks.forEach((t) => {
      const key = keys[(t.priority || 1) - 1];
      if (key) groups[key]++;
    });

    return Object.entries(groups).map(([label, value], i) => ({
      label,
      value,
      color: colors[i],
    }));
  }, [tasks]);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <div className="page-header animate-slide-up">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">
          Understand your productivity patterns and improve over time
        </p>
      </div>

      {/* Stats row */}
      <div className="grid-stats animate-slide-up stagger-1" style={{ marginBottom: "1.5rem" }}>
        <StatsCard label="Total Tasks" value={stats.total} icon={<BarChart3 size={20} />} color="var(--color-primary-light)" />
        <StatsCard label="Completed" value={stats.completed} icon={<CheckCircle size={20} />} color="var(--color-success)" />
        <StatsCard label="In Progress" value={stats.inProgress} icon={<Flame size={20} />} color="var(--color-accent)" />
        <StatsCard label="Overdue" value={stats.overdue} icon={<Clock size={20} />} color="var(--color-danger)" />
      </div>

      {/* Charts grid */}
      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        {/* Completion rate donut */}
        <div className="card-static animate-slide-up stagger-2" style={{ padding: "1.5rem" }}>
          <h3 className="section-title">
            <Target size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: "0.375rem" }} />
            Completion Rate
          </h3>
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "0.5rem" }}>
            <DonutChart
              value={stats.completed}
              total={stats.total}
              label={`${stats.completed} of ${stats.total} tasks`}
              color="var(--color-success)"
              size={140}
            />
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card-static animate-slide-up stagger-3" style={{ padding: "1.5rem" }}>
          <h3 className="section-title">
            <BarChart3 size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: "0.375rem" }} />
            By Category
          </h3>
          {categoryData.length > 0 ? (
            <BarChart data={categoryData} />
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
              No data yet
            </p>
          )}
        </div>

        {/* Weekly activity */}
        <div className="card-static animate-slide-up stagger-4" style={{ padding: "1.5rem" }}>
          <h3 className="section-title">
            <TrendingUp size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: "0.375rem" }} />
            This Week
          </h3>
          <MiniBarChart
            values={weeklyData.values}
            labels={weeklyData.labels}
            color="var(--color-primary)"
            height={100}
          />
        </div>
      </div>

      {/* Second row */}
      <div className="grid-2">
        {/* Priority breakdown */}
        <div className="card-static animate-slide-up stagger-5" style={{ padding: "1.5rem" }}>
          <h3 className="section-title">
            <BarChart3 size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: "0.375rem" }} />
            By Priority
          </h3>
          <BarChart data={priorityBreakdown} />
        </div>

        {/* AI Recommendations */}
        <div className="card-static animate-slide-up stagger-6" style={{ padding: "1.5rem" }}>
          <h3 className="section-title">
            <Lightbulb size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: "0.375rem" }} />
            AI Recommendations
          </h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchRecommendations}
            disabled={recsLoading || tasks.length === 0}
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            {recsLoading ? "Analyzing..." : "Get Personalized Tips"}
          </button>

          {aiRecs && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {aiRecs.motivational_tip && (
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.12)",
                    fontSize: "0.875rem",
                    color: "var(--color-primary-light)",
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  💡 {aiRecs.motivational_tip}
                </div>
              )}
              {aiRecs.insights?.map((insight, i) => (
                <p key={i} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  → {insight}
                </p>
              ))}
              {aiRecs.improvements?.map((tip, i) => (
                <p key={`imp-${i}`} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  ✦ {tip}
                </p>
              ))}
            </div>
          )}

          {!aiRecs && !recsLoading && (
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center" }}>
              Click above to get AI-powered productivity insights based on your task data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
