"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Layers, Shield, Brain, Clock, ChevronRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all fields", "warning");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast("Welcome back!", "success");
      } else {
        if (password.length < 6) {
          showToast("Password must be at least 6 characters", "warning");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showToast("Account created successfully!", "success");
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Brain, title: "AI-Powered", desc: "Smart task prioritization & scheduling" },
    { icon: Clock, title: "Deadline Rescue", desc: "Never miss a deadline again" },
    { icon: Shield, title: "Goal Tracking", desc: "Build habits & track progress" },
  ];

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Left side — Hero */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
        }}
      >
        {/* Decorative gradient orb */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.15), transparent)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "540px", margin: "0 auto", position: "relative" }}>
          {/* Logo */}
          <div className="animate-slide-up" style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(217, 119, 6, 0.35)",
              }}
            >
              <Layers size={28} color="white" />
            </div>
            <span
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, var(--text-primary), var(--color-primary-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ProTrack
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-slide-up stagger-1"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "1.25rem",
            }}
          >
            Your AI-Powered{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Productivity
            </span>{" "}
            Companion
          </h1>

          <p
            className="animate-slide-up stagger-2"
            style={{
              fontSize: "1.125rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
            }}
          >
            Stop missing deadlines. ProTrack uses AI to plan, prioritize, and guide you
            through your tasks — so you can focus on what matters.
          </p>

          {/* Feature pills */}
          <div className="animate-slide-up stagger-3" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(6, 182, 212, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color="var(--color-primary-light)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{f.title}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right side — Auth Form */}
      <div
        style={{
          width: "min(480px, 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          position: "relative",
        }}
      >
        {/* Decorative gradient orb */}
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="card-static animate-scale-in"
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "2.5rem",
          }}
        >
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: "2rem" }}>
            <button
              className={`tab ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`tab ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              marginBottom: "0.5rem",
            }}
          >
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              marginBottom: "1.75rem",
            }}
          >
            {isLogin
              ? "Sign in to continue to your dashboard"
              : "Start your productivity journey today"}
          </p>

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.375rem",
                }}
              >
                Email
              </label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.375rem",
                }}
              >
                Password
              </label>
              <input
                className="input"
                type="password"
                placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {loading ? (
                <LoadingSpinner size={18} />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              marginTop: "1.5rem",
            }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-primary-light)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.8125rem",
                fontFamily: "inherit",
              }}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}