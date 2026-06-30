import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: "ProTrack — AI Productivity Companion",
  description:
    "An AI-powered productivity companion that proactively assists you in planning, prioritizing, and completing tasks before deadlines are missed.",
  keywords: ["productivity", "AI", "task management", "deadline tracker", "scheduling"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}