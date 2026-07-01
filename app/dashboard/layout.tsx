"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import { PageLoader } from "@/components/LoadingSpinner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  const marginLeft = collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        style={{
          flex: 1,
          marginLeft: marginLeft,
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
