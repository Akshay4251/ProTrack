"use client";

import { Flame, Trash2, Check } from "lucide-react";

export interface Habit {
  id: string;
  title: string;
  frequency: string;
  streak: number;
  last_completed: string | null;
  created_at: string;
}

interface HabitTrackerProps {
  habits: Habit[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function HabitTracker({ habits, onComplete, onDelete }: HabitTrackerProps) {
  const isCompletedToday = (habit: Habit) => {
    if (!habit.last_completed) return false;
    const today = new Date().toISOString().split("T")[0];
    return habit.last_completed === today;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {habits.map((habit) => {
        const done = isCompletedToday(habit);
        return (
          <div
            key={habit.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1rem",
              borderRadius: "var(--radius-md)",
              background: done ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${done ? "rgba(34,197,94,0.15)" : "var(--border-subtle)"}`,
              transition: "all var(--transition-fast)",
            }}
          >
            {/* Check button */}
            <button
              onClick={() => !done && onComplete(habit.id)}
              disabled={done}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: `2px solid ${done ? "var(--color-success)" : "var(--border-default)"}`,
                background: done ? "var(--color-success)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: done ? "default" : "pointer",
                transition: "all var(--transition-fast)",
                flexShrink: 0,
                color: "white",
              }}
            >
              {done && <Check size={16} />}
            </button>

            {/* Habit info */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: done ? "var(--text-muted)" : "var(--text-primary)" }}>
                {habit.title}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                {habit.frequency}
              </p>
            </div>

            {/* Streak */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.625rem",
                borderRadius: "var(--radius-full)",
                background: habit.streak > 0 ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${habit.streak > 0 ? "rgba(245,158,11,0.2)" : "var(--border-subtle)"}`,
              }}
            >
              <Flame size={14} color={habit.streak > 0 ? "var(--color-warning)" : "var(--text-muted)"} />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: habit.streak > 0 ? "var(--color-warning)" : "var(--text-muted)",
                }}
              >
                {habit.streak}
              </span>
            </div>

            {/* Delete */}
            <button
              onClick={() => onDelete(habit.id)}
              className="btn btn-ghost btn-icon btn-sm"
              title="Delete habit"
            >
              <Trash2 size={14} color="var(--color-danger-light)" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
