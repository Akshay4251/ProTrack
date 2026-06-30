"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  suffix?: string;
  trend?: { value: number; positive: boolean };
}

export default function StatsCard({ label, value, icon, color, suffix, trend }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter
  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div
      className="card"
      style={{ padding: "1.25rem", position: "relative", overflow: "hidden" }}
    >
      {/* Glow accent */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}15, transparent)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: color,
              lineHeight: 1,
            }}
          >
            {displayValue}
            {suffix && (
              <span style={{ fontSize: "1rem", fontWeight: 600, marginLeft: "2px" }}>
                {suffix}
              </span>
            )}
          </p>
          {trend && (
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                marginTop: "0.375rem",
                color: trend.positive ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "var(--radius-md)",
            background: `${color}12`,
            border: `1px solid ${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
