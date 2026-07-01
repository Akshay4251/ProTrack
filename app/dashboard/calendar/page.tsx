"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import CalendarGrid from "@/components/CalendarGrid";
import { PageLoader } from "@/components/LoadingSpinner";
import type { Task } from "@/components/TaskCard";
import { formatDateTime, getStatusLabel, getCategoryColor } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      showToast(`Failed to load tasks: ${error.message} (${error.code})`, "error");
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(today);
  };

  // Tasks for the selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter((t) => {
      if (!t.deadline) return false;
      const taskDate = new Date(t.deadline);
      return (
        taskDate.getFullYear() === selectedDate.getFullYear() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getDate() === selectedDate.getDate()
      );
    });
  }, [tasks, selectedDate]);

  // Task count for current month
  const monthTaskCount = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
  }, [tasks, year, month]);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <div className="page-header animate-slide-up">
        <h1 className="page-title">Calendar</h1>
        <p className="page-subtitle">
          Visualize your deadlines and plan ahead · {monthTaskCount} task{monthTaskCount !== 1 ? "s" : ""} this month
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
        {/* Calendar */}
        <div className="card-static animate-slide-up stagger-1" style={{ padding: "1.5rem" }}>
          {/* Month navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <button className="btn btn-ghost btn-icon" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {MONTH_NAMES[month]} {year}
              </h2>
              <button
                onClick={goToToday}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary-light)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  marginTop: "0.125rem",
                }}
              >
                Go to Today
              </button>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <CalendarGrid
            year={year}
            month={month}
            tasks={tasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Selected day details */}
        <div className="card-static animate-slide-right stagger-2" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Calendar size={18} color="var(--color-primary-light)" />
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "Select a date"}
            </h3>
          </div>

          {selectedDateTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)" }}>
              <Calendar size={32} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
              <p style={{ fontSize: "0.875rem" }}>No tasks scheduled for this day</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {selectedDateTasks.map((task) => {
                const isOverdue = task.status !== "completed" && new Date(task.deadline) < new Date();
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      background: isOverdue ? "rgba(244,63,86,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isOverdue ? "rgba(244,63,86,0.15)" : "var(--border-subtle)"}`,
                      borderLeft: `3px solid ${getCategoryColor(task.category)}`,
                    }}
                  >
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      {task.title}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <Clock size={12} />
                      {formatDateTime(task.deadline)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                      <span
                        className={`badge ${task.status === "completed" ? "badge-success" : isOverdue ? "badge-danger" : "badge-muted"}`}
                        style={{ fontSize: "0.6875rem" }}
                      >
                        {isOverdue ? "Overdue" : getStatusLabel(task.status)}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          textTransform: "capitalize",
                          color: getCategoryColor(task.category),
                        }}
                      >
                        {task.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="divider" />

          <Link
            href="/dashboard/tasks"
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", textDecoration: "none" }}
          >
            <ExternalLink size={14} />
            Manage All Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}
