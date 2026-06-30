"use client";

import { useMemo } from "react";
import { getDaysInMonth, getFirstDayOfMonth, isSameDay, isToday } from "@/lib/utils";
import type { Task } from "./TaskCard";

interface CalendarGridProps {
  year: number;
  month: number;
  tasks: Task[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({ year, month, tasks, selectedDate, onSelectDate }: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!task.deadline) return;
      const key = new Date(task.deadline).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks]);

  const days: (number | null)[] = [];
  // Fill leading blanks
  for (let i = 0; i < firstDay; i++) days.push(null);
  // Fill actual days
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1px",
          marginBottom: "0.5rem",
        }}
      >
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              padding: "0.5rem 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
        }}
      >
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`blank-${i}`} style={{ aspectRatio: "1", padding: "0.25rem" }} />;
          }

          const date = new Date(year, month, day);
          const dateKey = date.toDateString();
          const dayTasks = tasksByDate[dateKey] || [];
          const today = isToday(date);
          const selected = selectedDate && isSameDay(date, selectedDate);
          const hasTasks = dayTasks.length > 0;
          const hasOverdue = dayTasks.some(
            (t) => t.status !== "completed" && new Date(t.deadline) < new Date()
          );
          const isPast = date < new Date() && !today;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(date)}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                borderRadius: "var(--radius-sm)",
                border: selected
                  ? "2px solid var(--color-primary)"
                  : today
                  ? "1px solid rgba(99,102,241,0.3)"
                  : "1px solid transparent",
                background: selected
                  ? "rgba(99,102,241,0.12)"
                  : today
                  ? "rgba(99,102,241,0.06)"
                  : "rgba(255,255,255,0.01)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                position: "relative",
                fontFamily: "'Inter', sans-serif",
                color: "inherit",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!selected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  (e.currentTarget as HTMLElement).style.background = today ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.01)";
                }
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: today ? 700 : 500,
                  color: isPast
                    ? "var(--text-muted)"
                    : today
                    ? "var(--color-primary-light)"
                    : "var(--text-primary)",
                }}
              >
                {day}
              </span>

              {/* Task dots */}
              {hasTasks && (
                <div style={{ display: "flex", gap: "2px" }}>
                  {dayTasks.slice(0, 3).map((t, j) => (
                    <div
                      key={j}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: hasOverdue && t.status !== "completed"
                          ? "var(--color-danger)"
                          : t.status === "completed"
                          ? "var(--color-success)"
                          : "var(--color-primary)",
                      }}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span style={{ fontSize: "0.5rem", color: "var(--text-muted)" }}>+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}

              {/* Today indicator */}
              {today && (
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "3px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    boxShadow: "0 0 6px rgba(99,102,241,0.5)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
