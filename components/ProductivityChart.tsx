"use client";

interface DonutChartProps {
  value: number;
  total: number;
  label: string;
  color: string;
  size?: number;
}

export function DonutChart({ value, total, label, color, size = 120 }: DonutChartProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{percentage}%</span>
        </div>
      </div>
      <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  maxValue?: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              width: "80px",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textAlign: "right",
              textTransform: "capitalize",
              flexShrink: 0,
            }}
          >
            {item.label}
          </span>
          <div style={{ flex: 1, height: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
            <div
              style={{
                width: `${(item.value / max) * 100}%`,
                height: "100%",
                background: item.color,
                borderRadius: "var(--radius-full)",
                transition: "width 0.8s ease-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: "0.5rem",
                minWidth: item.value > 0 ? "30px" : "0",
              }}
            >
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "white" }}>
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface MiniBarProps {
  values: number[];
  labels: string[];
  color: string;
  height?: number;
}

export function MiniBarChart({ values, labels, color, height = 80 }: MiniBarProps) {
  const max = Math.max(...values, 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height }}>
      {values.map((val, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "100%",
              height: `${Math.max((val / max) * 100, 4)}%`,
              background: color,
              borderRadius: "3px 3px 0 0",
              transition: "height 0.6s ease-out",
              opacity: val > 0 ? 1 : 0.2,
              minHeight: "2px",
            }}
          />
          <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
