"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Send, X, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

type ChatMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  text: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
}

let nextId = 0;
const makeMsg = (role: ChatMessage["role"], text: string): ChatMessage => ({ id: ++nextId, role, text });

const STARTER_PROMPTS = [
  "What evidence do I need for ISO 27001 §A.5.1?",
  "How do I write a risk treatment plan?",
  "Explain the difference between ISO 27001 and SOC 2",
  "What's a sensible password policy for a 20-person team?",
];

export function AIAssistantDrawer({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    makeMsg(
      "assistant",
      "Hi! I'm your compliance AI assistant. Ask me anything about ISO standards, controls, evidence, or audit prep. I have context on the standards in your workspace.",
    ),
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [quotaError, setQuotaErr] = useState<string | null>(null);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setQuotaErr(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setMessages((prev) => [...prev, makeMsg("user", trimmed)]);
    setInput("");
    setLoading(true);
    setQuotaErr(null);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      if (res.status === 402 && data.upgradeRequired) {
        setQuotaErr(data.error ?? "Monthly AI quota reached. Upgrade for unlimited queries.");
        return;
      }
      if (!res.ok) {
        setMessages((prev) => [...prev, makeMsg("system", data.error ?? "Couldn't reach the AI right now. Please try again in a moment.")]);
        return;
      }
      setMessages((prev) => [...prev, makeMsg("assistant", data.answer ?? "(no response)")]);
    } catch {
      setMessages((prev) => [...prev, makeMsg("system", "Network error — please try again.")]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  // Don't render anything when closed — drawer animates in via state-driven mounting
  // Skip on the server too: createPortal needs `document` which only exists client-side.
  if (!open || typeof document === "undefined") return null;

  // Render via portal into <body> so the drawer escapes the dashboard <header>'s
  // backdrop-filter / containing block. Without the portal, `position: fixed`
  // resolves relative to the header (h-14 = 56px) and the drawer collapses
  // to a 56px-tall sliver in the top-right.
  return createPortal(
    <>
      {/* Backdrop */}
      <button
        aria-label="Close AI assistant"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] cursor-default"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="AI assistant"
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-to-br from-blue-50 via-violet-50 to-blue-50 dark:from-blue-950/30 dark:via-violet-950/30 dark:to-blue-950/30">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-sm">
              <Sparkles className="size-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">Compliance AI</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Ask about controls, evidence, risks, audits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-background/50 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m) => {
            if (m.role === "system") {
              return (
                <div key={m.id} className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  {m.text}
                </div>
              );
            }
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2 text-sm">
                <Loader2 className="size-3.5 animate-spin" />
                Thinking…
              </div>
            </div>
          )}

          {quotaError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs space-y-2">
              <p className="font-semibold text-amber-900">Monthly AI quota reached</p>
              <p className="text-amber-700">{quotaError}</p>
              <Link
                href="/settings?tab=billing"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-7 px-3 mt-1"
              >
                Upgrade to Professional
              </Link>
            </div>
          )}

          {/* Suggested prompts (only when there's nothing else going on) */}
          {messages.length === 1 && !loading && !quotaError && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Try asking</p>
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted hover:border-blue-300 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border p-3 bg-background">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              placeholder="Ask about controls, evidence, audits…"
              disabled={loading}
              className="flex-1 text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="size-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
            Enter to send · Shift+Enter for newline · Esc to close
          </p>
        </form>
      </aside>
    </>,
    document.body,
  );
}

// Top-right trigger button — distinctive gradient sparkles icon
export function AIAssistantTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative size-9 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-500 hover:from-blue-600 hover:via-violet-600 hover:to-purple-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all group"
      aria-label="Open AI assistant"
      title="Compliance AI assistant"
    >
      <Sparkles className="size-4" />
      <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 border-2 border-background" />
    </button>
  );
}
