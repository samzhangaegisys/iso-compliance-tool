"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./chat-widget";

// Render the chat widget only on public/landing pages, not inside the app.
export function ChatWidgetGuard() {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/evidence") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/standards") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/activity");

  if (isDashboard) return null;
  return <ChatWidget />;
}
