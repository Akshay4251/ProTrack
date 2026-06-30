"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/goals", label: "Goals & Habits", icon: Target },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      <aside
        style={{
          width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          background: "rgba(10, 10, 26, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border-subtle)",
          transition: "width var(--transition-base)",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: collapsed ? "1.25rem 0.875rem" : "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            minHeight: "64px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 16px rgba(99, 102, 241, 0.3)",
            }}
          >
            <Zap size={20} color="white" />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                background: "linear-gradient(135deg, var(--text-primary), var(--color-primary-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                whiteSpace: "nowrap",
              }}
            >
              ProTrack
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: collapsed ? "0.75rem" : "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  color: active ? "white" : "var(--text-secondary)",
                  background: active
                    ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))"
                    : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 500,
                  transition: "all var(--transition-fast)",
                  whiteSpace: "nowrap",
                  justifyContent: collapsed ? "center" : "flex-start",
                  position: "relative",
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && item.label}
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      left: collapsed ? "50%" : 0,
                      top: collapsed ? "auto" : "50%",
                      bottom: collapsed ? 0 : "auto",
                      transform: collapsed ? "translateX(-50%)" : "translateY(-50%)",
                      width: collapsed ? "20px" : "3px",
                      height: collapsed ? "3px" : "20px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-primary)",
                      boxShadow: "0 0 8px rgba(99,102,241,0.5)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          style={{
            padding: "0.75rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {/* User info */}
          {!collapsed && user && (
            <div
              style={{
                padding: "0.5rem 0.75rem",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-ghost"
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem",
              fontSize: "0.8125rem",
            }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && "Collapse"}
          </button>

          {/* Logout */}
          <button
            onClick={signOut}
            className="btn btn-ghost"
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem",
              fontSize: "0.8125rem",
              color: "var(--color-danger-light)",
            }}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={18} />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
