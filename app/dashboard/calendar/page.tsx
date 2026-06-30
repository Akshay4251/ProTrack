"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import CalendarGrid from "@/components/CalendarGrid";
import { PageLoader, LoadingSpinner } from "@/components/LoadingSpinner";
import type { Task } from "@/components/TaskCard";
import { formatDateTime, getStatusLabel, getCategoryColor } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar, Clock, ExternalLink, Link2, Unlink } from "lucide-react";
import Link from "next/link";

interface GoogleEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
}

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

  // Google Calendar state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    if (user) {
      fetchTasks();
      checkGoogleConnection();
    }
  }, [user]);

  // Check URL params for google connection status
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("google") === "connected") {
        showToast("Google Calendar connected! 🎉", "success");
        setGoogleConnected(true);
        fetchGoogleEvents();
        window.history.replaceState({}, "", "/dashboard/calendar");
      } else if (params.get("error")) {
        showToast("Failed to connect Google Calendar", "error");
        window.history.replaceState({}, "", "/dashboard/calendar");
      }
    }
  }, []);

  const fetchTasks = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (error) showToast("Failed to load tasks", "error");
    else setTasks(data || []);
    setLoading(false);
  };

  const checkGoogleConnection = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/calendar/events?userId=${user.id}`);
      const data = await res.json();
      if (data.connected) {
        setGoogleConnected(true);
        setGoogleEvents(data.events || []);
      }
    } catch {
      // Not connected — that's fine
    }
  };

  const connectGoogle = async () => {
    if (!user) return;
    setGoogleLoading(true);
    try {
      const res = await fetch(`/api/auth/google?userId=${user.id}`);
      const data = await res.json();
      if (data.error) {
        showToast(data.error, "warning");
        setGoogleLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      showToast("Failed to start Google Calendar connection", "error");
      setGoogleLoading(false);
    }
  };

  const fetchGoogleEvents = async () => {
    if (!user) return;
    try {
      const timeMin = new Date(year, month, 1).toISOString();
      const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const res = await fetch(`/api/calendar/events?userId=${user.id}&timeMin=${timeMin}&timeMax=${timeMax}`);
      const data = await res.json();
      if (data.events) setGoogleEvents(data.events);
    } catch {
      // silently fail
    }
  };

  // Refetch google events when month changes
  useEffect(() => {
    if (googleConnected && user) fetchGoogleEvents();
  }, [year, month, googleConnected]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
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

  // Google events for the selected date
  const selectedDateGoogleEvents = useMemo(() => {
    if (!selectedDate || !googleEvents.length) return [];
    return googleEvents.filter((e) => {
      const eventDate = new Date(e.start);
      return (
        eventDate.getFullYear() === selectedDate.getFullYear() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getDate() === selectedDate.getDate()
      );
    });
  }, [googleEvents, selectedDate]);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Calendar</h1>
            <p className="page-subtitle">
              Visualize your deadlines · {monthTaskCount} tasks this month
              {googleConnected && ` · ${googleEvents.length} Google events`}
            </p>
          </div>
          {/* Google Calendar connect button */}
          <button
            className={`btn ${googleConnected ? "btn-success" : "btn-secondary"} btn-sm`}
            onClick={googleConnected ? undefined : connectGoogle}
            disabled={googleLoading || googleConnected}
            style={{ cursor: googleConnected ? "default" : "pointer" }}
          >
            {googleLoading ? (
              <LoadingSpinner size={14} />
            ) : googleConnected ? (
              <><Link2 size={14} /> Google Connected</>
            ) : (
              <><Unlink size={14} /> Connect Google Calendar</>
            )}
          </button>
        </div>
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

          {/* ProTrack tasks */}
          {selectedDateTasks.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ProTrack Tasks
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedDateTasks.map((task) => {
                  const isOverdue = task.status !== "completed" && new Date(task.deadline) < new Date();
                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "var(--radius-sm)",
                        background: isOverdue ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isOverdue ? "rgba(239,68,68,0.15)" : "var(--border-subtle)"}`,
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Google Calendar events */}
          {selectedDateGoogleEvents.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📅 Google Calendar
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedDateGoogleEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(66,133,244,0.06)",
                      border: "1px solid rgba(66,133,244,0.15)",
                      borderLeft: "3px solid #4285F4",
                    }}
                  >
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      {event.summary}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <Clock size={12} />
                      {new Date(event.start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      {" – "}
                      {new Date(event.end).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDateTasks.length === 0 && selectedDateGoogleEvents.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)" }}>
              <Calendar size={32} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
              <p style={{ fontSize: "0.875rem" }}>No events scheduled for this day</p>
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
