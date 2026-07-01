"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import TaskCard, { type Task } from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import EmptyState from "@/components/EmptyState";
import { PageLoader } from "@/components/LoadingSpinner";
import { CheckSquare, Plus, Search, Filter, X, ListOrdered } from "lucide-react";

type FilterStatus = "all" | "pending" | "in-progress" | "completed";

export default function TasksPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "created">("deadline");

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      showToast(`Failed to load tasks: ${error.message} (${error.code})`, "error");
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const addTask = async (task: {
    title: string;
    description: string;
    deadline: string;
    estimated_hours: number;
    energy_level: string;
    priority: number;
    category: string;
  }) => {
    if (!user) return;
    setAddingTask(true);
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      ...task,
      deadline: task.deadline || null,
    });

    if (error) {
      showToast("Failed to add task", "error");
    } else {
      showToast("Task added!", "success");
      setShowForm(false);
      fetchTasks();
    }
    setAddingTask(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) {
      showToast("Failed to update task", "error");
    } else {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      showToast(
        status === "completed" ? "Task completed! 🎉" : `Task marked as ${status}`,
        "success"
      );
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      showToast("Failed to delete task", "error");
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast("Task deleted", "info");
    }
  };

  // Filtering and sorting
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== "all") {
      result = result.filter((t) => t.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "priority":
          return b.priority - a.priority;
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, search, filterStatus, filterCategory, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return Array.from(cats);
  }, [tasks]);

  const statusCounts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }), [tasks]);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-slide-up">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">
              {tasks.length} total · {statusCounts.pending} pending · {statusCounts["in-progress"]} active
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Close" : "New Task"}
          </button>
        </div>
      </div>

      {/* Task Form (collapsible) */}
      {showForm && (
        <div className="card-static animate-slide-down" style={{ marginBottom: "1.5rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Create New Task</h2>
          <TaskForm onSubmit={addTask} onCancel={() => setShowForm(false)} loading={addingTask} />
        </div>
      )}

      {/* Filters & Search */}
      <div className="animate-slide-up stagger-1" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            className="input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Status tabs */}
          <div className="tabs" style={{ margin: 0, flex: "none" }}>
            {(["all", "pending", "in-progress", "completed"] as FilterStatus[]).map((status) => (
              <button
                key={status}
                className={`tab ${filterStatus === status ? "active" : ""}`}
                onClick={() => setFilterStatus(status)}
                style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
              >
                {status === "all" ? "All" : status === "in-progress" ? "Active" : status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                <span style={{ opacity: 0.7, marginLeft: "2px" }}>({statusCounts[status]})</span>
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: "auto", minWidth: "120px", padding: "0.375rem 2rem 0.375rem 0.75rem", fontSize: "0.8125rem" }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>

            <ListOrdered size={14} color="var(--text-muted)" />
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "deadline" | "priority" | "created")}
              style={{ width: "auto", minWidth: "120px", padding: "0.375rem 2rem 0.375rem 0.75rem", fontSize: "0.8125rem" }}
            >
              <option value="deadline">By Deadline</option>
              <option value="priority">By Priority</option>
              <option value="created">By Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="card-static">
          <EmptyState
            icon={<CheckSquare size={32} />}
            title={search || filterStatus !== "all" ? "No matching tasks" : "No tasks yet"}
            description={
              search || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first task to get started with AI-powered productivity"
            }
            action={
              !search && filterStatus === "all" ? (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  <Plus size={18} />
                  Create Task
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid-cards">
          {filteredTasks.map((task, i) => (
            <div key={task.id} className={`animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
              <TaskCard
                task={task}
                onStatusChange={updateStatus}
                onDelete={deleteTask}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
