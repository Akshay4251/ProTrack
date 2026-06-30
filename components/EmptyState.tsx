"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in">
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-xl)",
          background: "rgba(99, 102, 241, 0.08)",
          border: "1px solid rgba(99, 102, 241, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.25rem",
          color: "var(--color-primary-light)",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          maxWidth: "320px",
          lineHeight: 1.6,
          marginBottom: action ? "1.25rem" : 0,
        }}
      >
        {description}
      </p>
      {action}
    </div>
  );
}
