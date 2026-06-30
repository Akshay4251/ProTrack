"use client";

import type { Task } from "./TaskCard";
import { getUrgencyScore, getUrgencyColor, formatDeadline } from "@/lib/utils";
import { AlertTriangle, Clock } from "lucide-react";

interface UrgencyTimelineProps {
  tasks: Task[];
}

export default function UrgencyTimeline({ tasks }: UrgencyTimelineProps) {
  // Filter to pending/in-progress tasks with deadlines, sorted by urgency
  const urgentTasks = tasks
    .filter((t) => t.status !== "completed" && t.deadline)
    .map((t) => ({
      ...t,
      urgency: getUrgencyScore(t.deadline),
    }))
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, 8);

  if (urgentTasks.length === 0) {
    return (
      <div className="card-static" style={{ padding: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={18} color="var(--color-primary-light)" />
          Urgency Timeline
        </h3>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem 0" }}>
          No upcoming deadlines — you&apos;re all clear! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="card-static" style={{ padding: "1.25rem" }}>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Clock size={18} color="var(--color-primary-light)" />
        Urgency Timeline
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {urgentTasks.map((task, i) => {
          const color = getUrgencyColor(task.urgency);
          const isOverdue = task.urgency >= 100;

          return (
            <div
              key={task.id}
              className={`animate-slide-right stagger-${Math.min(i + 1, 6)}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                background: isOverdue ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isOverdue ? "rgba(239,68,68,0.15)" : "var(--border-subtle)"}`,
              }}
            >
              {/* Urgency bar */}
              <div
                style={{
                  width: "4px",
                  height: "32px",
                  borderRadius: "var(--radius-full)",
                  background: color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${color}40`,
                }}
              />

              {/* Task info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {isOverdue && <AlertTriangle size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "-1px" }} color="var(--color-danger)" />}
                  {task.title}
                </p>
                <p style={{ fontSize: "0.75rem", color: color, fontWeight: 500 }}>
                  {formatDeadline(task.deadline)}
                </p>
              </div>

              {/* Urgency meter */}
              <div style={{ width: "50px", flexShrink: 0 }}>
                <div
                  style={{
                    height: "4px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(task.urgency, 100)}%`,
                      height: "100%",
                      background: color,
                      borderRadius: "var(--radius-full)",
                      transition: "width var(--transition-slow)",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
