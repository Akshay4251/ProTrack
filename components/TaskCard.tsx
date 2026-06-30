"use client";

import { formatDeadline, getUrgencyScore, getUrgencyColor, getUrgencyLabel, getPriorityLabel, getStatusColor, getStatusLabel, getEnergyIcon, getCategoryColor } from "@/lib/utils";
import { Clock, Flame, Trash2, CheckCircle, Play, RotateCcw } from "lucide-react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  estimated_hours: number;
  energy_level: string;
  status: string;
  priority: number;
  category: string;
  created_at: string;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const urgencyScore = task.deadline ? getUrgencyScore(task.deadline) : 0;
  const urgencyColor = getUrgencyColor(urgencyScore);
  const isOverdue = urgencyScore >= 100 && task.status !== "completed";
  const isCompleted = task.status === "completed";

  const nextStatus = (current: string) => {
    switch (current) {
      case "pending": return "in-progress";
      case "in-progress": return "completed";
      case "completed": return "pending";
      default: return "pending";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Play size={14} />;
      case "in-progress": return <CheckCircle size={14} />;
      case "completed": return <RotateCcw size={14} />;
      default: return <Play size={14} />;
    }
  };

  const statusAction = (status: string) => {
    switch (status) {
      case "pending": return "Start";
      case "in-progress": return "Complete";
      case "completed": return "Reopen";
      default: return "Start";
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        opacity: isCompleted ? 0.6 : 1,
        borderLeft: `3px solid ${isOverdue ? "var(--color-danger)" : isCompleted ? "var(--color-success)" : urgencyColor}`,
        animation: isOverdue ? "pulse-glow 2s ease-in-out infinite" : undefined,
        position: "relative",
      }}
    >
      {/* Top row: category + priority + urgency */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        {/* Category badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.125rem 0.5rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.6875rem",
            fontWeight: 600,
            background: `${getCategoryColor(task.category)}18`,
            color: getCategoryColor(task.category),
            border: `1px solid ${getCategoryColor(task.category)}25`,
            textTransform: "capitalize",
          }}
        >
          {task.category}
        </span>

        {/* Priority */}
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          P{task.priority} · {getPriorityLabel(task.priority)}
        </span>

        {/* Status badge */}
        <span
          className={`badge ${task.status === "completed" ? "badge-success" : task.status === "in-progress" ? "badge-primary" : "badge-muted"}`}
          style={{ marginLeft: "auto", fontSize: "0.6875rem" }}
        >
          {getStatusLabel(task.status)}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          marginBottom: "0.375rem",
          textDecoration: isCompleted ? "line-through" : "none",
          color: isCompleted ? "var(--text-muted)" : "var(--text-primary)",
        }}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            marginBottom: "0.75rem",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.description}
        </p>
      )}

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {task.deadline && (
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: isOverdue ? "var(--color-danger)" : urgencyColor }}>
            <Clock size={14} />
            {formatDeadline(task.deadline)}
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <Flame size={14} />
          {task.estimated_hours}h
        </span>
        <span>
          {getEnergyIcon(task.energy_level)} {task.energy_level}
        </span>
        {!isCompleted && task.deadline && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: urgencyColor,
            }}
          >
            {getUrgencyLabel(urgencyScore)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => onStatusChange(task.id, nextStatus(task.status))}
          className={`btn btn-sm ${task.status === "in-progress" ? "btn-success" : "btn-secondary"}`}
          style={{ flex: 1 }}
        >
          {statusIcon(task.status)}
          {statusAction(task.status)}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn btn-sm btn-danger btn-icon"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
