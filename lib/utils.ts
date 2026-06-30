// Date & time utilities
export function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (diff < 0) {
    const overdueDays = Math.abs(days);
    return overdueDays === 0
      ? `Overdue by ${Math.abs(hours)}h`
      : `Overdue by ${overdueDays}d`;
  }
  if (hours < 1) return "Less than 1h left";
  if (hours < 24) return `${hours}h left`;
  if (days < 7) return `${days}d left`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

// Urgency calculation (0-100, higher = more urgent)
export function getUrgencyScore(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft < 0) return 100; // overdue
  if (hoursLeft < 2) return 95;
  if (hoursLeft < 6) return 85;
  if (hoursLeft < 12) return 75;
  if (hoursLeft < 24) return 60;
  if (hoursLeft < 48) return 45;
  if (hoursLeft < 72) return 30;
  if (hoursLeft < 168) return 15;
  return 5;
}

export function getUrgencyColor(score: number): string {
  if (score >= 80) return "var(--color-danger)";
  if (score >= 50) return "var(--color-warning)";
  if (score >= 25) return "var(--color-accent)";
  return "var(--color-success)";
}

export function getUrgencyLabel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 50) return "Urgent";
  if (score >= 25) return "Moderate";
  return "Relaxed";
}

// Priority helpers
export function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    1: "Low",
    2: "Medium-Low",
    3: "Medium",
    4: "High",
    5: "Critical",
  };
  return labels[priority] || "Medium";
}

export function getPriorityColor(priority: number): string {
  if (priority >= 5) return "var(--color-danger)";
  if (priority >= 4) return "var(--color-warning)";
  if (priority >= 3) return "var(--color-accent)";
  return "var(--color-muted)";
}

// Status helpers
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "var(--color-success)";
    case "in-progress":
      return "var(--color-accent)";
    default:
      return "var(--color-muted)";
  }
}

// Energy level helpers
export function getEnergyIcon(level: string): string {
  switch (level) {
    case "high":
      return "⚡";
    case "medium":
      return "🔋";
    case "low":
      return "🪫";
    default:
      return "🔋";
  }
}

// Calendar helpers
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// Greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Category presets
export const CATEGORIES = [
  "general",
  "work",
  "study",
  "personal",
  "health",
  "finance",
  "meeting",
  "deadline",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    general: "#8b8b8b",
    work: "#6366f1",
    study: "#3b82f6",
    personal: "#a855f7",
    health: "#22c55e",
    finance: "#eab308",
    meeting: "#f97316",
    deadline: "#ef4444",
  };
  return colors[category] || colors.general;
}
