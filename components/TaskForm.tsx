"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface TaskFormProps {
  onSubmit: (task: {
    title: string;
    description: string;
    deadline: string;
    estimated_hours: number;
    energy_level: string;
    priority: number;
    category: string;
  }) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function TaskForm({ onSubmit, onCancel, loading }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [hours, setHours] = useState(1);
  const [energy, setEnergy] = useState("medium");
  const [priority, setPriority] = useState(3);
  const [category, setCategory] = useState("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, deadline, estimated_hours: hours, energy_level: energy, priority, category });
    setTitle("");
    setDescription("");
    setDeadline("");
    setHours(1);
    setEnergy("medium");
    setPriority(3);
    setCategory("general");
  };

  const priorityLabels = ["", "Low", "Medium-Low", "Medium", "High", "Critical"];
  const priorityColors = ["", "var(--text-muted)", "var(--color-info)", "var(--color-warning)", "var(--color-warning)", "var(--color-danger)"];

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Title */}
      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
          Task Title *
        </label>
        <input
          className="input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
          Description
        </label>
        <textarea
          className="input"
          placeholder="Add details, notes, or context..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          style={{ resize: "vertical", minHeight: "60px" }}
        />
      </div>

      {/* Two-column row: Deadline + Hours */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
            Deadline
          </label>
          <input
            className="input"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
            Estimated Hours
          </label>
          <input
            className="input"
            type="number"
            min={0.5}
            max={100}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Two-column row: Category + Energy */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
            Category
          </label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
            Energy Level
          </label>
          <select className="input" value={energy} onChange={(e) => setEnergy(e.target.value)}>
            <option value="low">🪫 Low</option>
            <option value="medium">🔋 Medium</option>
            <option value="high">⚡ High</option>
          </select>
        </div>
      </div>

      {/* Priority slider */}
      <div>
        <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          <span>Priority</span>
          <span style={{ color: priorityColors[priority], fontWeight: 700 }}>{priorityLabels[priority]}</span>
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          style={{
            width: "100%",
            height: "6px",
            appearance: "none",
            background: `linear-gradient(to right, var(--color-info), var(--color-warning), var(--color-danger))`,
            borderRadius: "var(--radius-full)",
            outline: "none",
            cursor: "pointer",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          <span>Low</span>
          <span>Critical</span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading || !title.trim()}>
          <Plus size={18} />
          {loading ? "Adding..." : "Add Task"}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <X size={18} />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
