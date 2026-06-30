"use client";

export function LoadingSpinner({ size = 24, text }: { size?: number; text?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          width: size,
          height: size,
          border: "2.5px solid rgba(255,255,255,0.08)",
          borderTop: "2.5px solid var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      {text && (
        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{text}</span>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <LoadingSpinner size={40} text="Loading..." />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card-static" style={{ padding: "1.5rem" }}>
      <div className="skeleton" style={{ height: "1rem", width: "60%", marginBottom: "0.75rem" }} />
      <div className="skeleton" style={{ height: "0.75rem", width: "40%", marginBottom: "1rem" }} />
      <div className="skeleton" style={{ height: "0.75rem", width: "80%" }} />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid-stats">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card-static" style={{ padding: "1.25rem" }}>
          <div className="skeleton" style={{ height: "0.75rem", width: "50%", marginBottom: "0.75rem" }} />
          <div className="skeleton" style={{ height: "2rem", width: "40%" }} />
        </div>
      ))}
    </div>
  );
}
