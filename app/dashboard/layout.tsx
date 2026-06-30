"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import { PageLoader } from "@/components/LoadingSpinner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState("var(--sidebar-width)");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Listen for sidebar width changes
  useEffect(() => {
    const checkWidth = () => {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        setSidebarWidth(`${sidebar.offsetWidth}px`);
      }
    };

    checkWidth();
    const observer = new MutationObserver(checkWidth);
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["style"] });
    }

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          transition: "margin-left var(--transition-base)",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>
    </div>
  );
}
