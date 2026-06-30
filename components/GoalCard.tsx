"use client";

import { Target, Trash2, ChevronUp } from "lucide-react";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date: string | null;
  progress: number;
  status: string;
  created_at: string;
}

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
}

export default function GoalCard({ goal, onUpdateProgress, onDelete }: GoalCardProps) {
  const isCompleted = goal.status === "completed" || goal.progress >= 100;
  const daysLeft = goal.target_date
    ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const progressColor =
    goal.progress >= 100 ? "var(--color-success)" :
    goal.progress >= 60 ? "var(--color-primary)" :
    goal.progress >= 30 ? "var(--color-warning)" :
    "var(--color-danger)";

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Target size={18} color={progressColor} />
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, textDecoration: isCompleted ? "line-through" : "none" }}>
            {goal.title}
          </h3>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onDelete(goal.id)} title="Delete">
          <Trash2 size={14} color="var(--color-danger-light)" />
        </button>
      </div>

      {goal.description && (
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
          {goal.description}
        </p>
      )}

      {/* Progress bar */}
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.375rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Progress</span>
          <span style={{ fontWeight: 700, color: progressColor }}>{goal.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${goal.progress}%`, background: progressColor }} />
        </div>
      </div>

      {/* Meta + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {daysLeft !== null && (
            <span style={{ color: daysLeft < 0 ? "var(--color-danger)" : daysLeft <= 7 ? "var(--color-warning)" : "var(--text-muted)" }}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
            </span>
          )}
        </div>
        {!isCompleted && (
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onUpdateProgress(goal.id, Math.min(goal.progress + 10, 100))}
              title="Increase progress by 10%"
            >
              <ChevronUp size={14} />
              +10%
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
