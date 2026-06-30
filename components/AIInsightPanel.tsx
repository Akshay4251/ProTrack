"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/ai";
import { LoadingSpinner } from "./LoadingSpinner";
import { Brain, ChevronDown, ChevronUp, Sparkles, AlertTriangle, ListOrdered, Clock, Lightbulb, Target } from "lucide-react";

interface AIInsightPanelProps {
  result: AnalysisResult | null;
  loading: boolean;
  onAnalyze: () => void;
  taskCount: number;
}

export default function AIInsightPanel({ result, loading, onAnalyze, taskCount }: AIInsightPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    priority: true,
    risk: true,
    schedule: false,
    recommendations: true,
    focus: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "var(--color-success)";
    if (score >= 40) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  return (
    <div className="card-static" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={20} color="var(--color-primary-light)" />
        </div>
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>AI Insights</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Powered by ProTrack AI</p>
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: "100%", marginBottom: "1.25rem" }}
        onClick={onAnalyze}
        disabled={loading || taskCount === 0}
      >
        {loading ? (
          <LoadingSpinner size={18} />
        ) : (
          <>
            <Sparkles size={18} />
            {result ? "Re-analyze Tasks" : "Generate AI Plan"}
          </>
        )}
      </button>

      {loading && (
        <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          <p>ProTrack AI is analyzing your tasks...</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            This may take a few seconds
          </p>
        </div>
      )}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Productivity Score */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              padding: "1.5rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Productivity Score
            </p>
            <div style={{ position: "relative", width: "100px", height: "100px" }}>
              <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={getScoreColor(result.productivity_score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(result.productivity_score / 100) * 264} 264`}
                  style={{ transition: "stroke-dasharray 1s ease-out" }}
                />
              </svg>
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: getScoreColor(result.productivity_score),
                }}
              >
                {result.productivity_score}
              </span>
            </div>
          </div>

          {/* Focus Suggestion */}
          {result.focus_suggestion && (
            <CollapsibleSection
              icon={<Target size={16} />}
              title="Focus Right Now"
              expanded={expandedSections.focus}
              onToggle={() => toggleSection("focus")}
              accentColor="var(--color-primary)"
            >
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {result.focus_suggestion}
              </p>
            </CollapsibleSection>
          )}

          {/* Risk Analysis */}
          <CollapsibleSection
            icon={<AlertTriangle size={16} />}
            title="Risk Analysis"
            expanded={expandedSections.risk}
            onToggle={() => toggleSection("risk")}
            accentColor="var(--color-warning)"
          >
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {result.risk_analysis}
            </p>
          </CollapsibleSection>

          {/* Priority Order */}
          <CollapsibleSection
            icon={<ListOrdered size={16} />}
            title="Priority Order"
            expanded={expandedSections.priority}
            onToggle={() => toggleSection("priority")}
            accentColor="var(--color-accent)"
          >
            <ol style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {result.priority_order?.map((task, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.15)",
                      color: "var(--color-primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  {task}
                </li>
              ))}
            </ol>
          </CollapsibleSection>

          {/* Schedule Plan */}
          {result.schedule_plan && result.schedule_plan.length > 0 && (
            <CollapsibleSection
              icon={<Clock size={16} />}
              title="Schedule Plan"
              expanded={expandedSections.schedule}
              onToggle={() => toggleSection("schedule")}
              accentColor="var(--color-info)"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {result.schedule_plan.map((block, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      fontSize: "0.8125rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255,255,255,0.02)",
                      borderLeft: "2px solid var(--color-info)",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--color-info)", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                      {block.start}–{block.end}
                    </span>
                    <div>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{block.task}</span>
                      {block.tip && (
                        <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>💡 {block.tip}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Recommendations */}
          <CollapsibleSection
            icon={<Lightbulb size={16} />}
            title="Recommendations"
            expanded={expandedSections.recommendations}
            onToggle={() => toggleSection("recommendations")}
            accentColor="var(--color-success)"
          >
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {result.recommendations?.map((rec, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "var(--color-success)", flexShrink: 0 }}>→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  icon,
  title,
  expanded,
  onToggle,
  accentColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          background: "rgba(255,255,255,0.02)",
          border: "none",
          color: "var(--text-primary)",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
        {title}
        <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {expanded && (
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border-subtle)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
