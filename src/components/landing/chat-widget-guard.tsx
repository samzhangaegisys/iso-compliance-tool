"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./chat-widget";

// Emma is the public-site virtual customer-service rep. She is NEVER shown inside
// the dashboard — in-app users get a dedicated AI assistant drawer instead
// (src/components/dashboard/ai-assistant-drawer.tsx).
const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/evidence",
  "/reports",
  "/standards",
  "/team",
  "/settings",
  "/activity",
  "/risks",
  "/vendors",
  "/policies",
  "/audit-log",
  "/cross-mappings",
  "/frameworks",
  "/api-docs", // dev/customer-facing API docs render in the same shell
];

export function ChatWidgetGuard() {
  const pathname = usePathname();
  const inApp = APP_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (inApp) return null;
  return <ChatWidget />;
}
