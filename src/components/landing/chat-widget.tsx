"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
};

const FAQ: Record<string, string> = {
  "What ISO standards do you support?":
    "ISOComply supports ISO 27001 (Information Security), ISO 9001 (Quality), ISO 14001 (Environmental), ISO 45001 (Health & Safety), and ISO 42001 (AI Management). You can manage multiple standards simultaneously and spot shared controls.",
  "What's the cheapest plan?":
    "Our Starter plan is A$29/user/month with a 5-user minimum, billed monthly. It includes 1 ISO standard of your choice, AI-guided gap analysis, the evidence vault, PDF audit reports, and email support. Switch to annual billing and save 20%. Upgrade to Professional or Enterprise any time from your dashboard.",
  "How long does setup take?":
    "Most teams are up and running within an hour. You select your ISO standards, import your existing controls (or start fresh), and the gap analysis engine generates your first readiness report immediately. No lengthy onboarding or professional services needed.",
  "How is my data secured?":
    "ISOComply is SOC 2 Type II certified and GDPR ready. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We operate on enterprise-grade, ISO 27001-aligned cloud infrastructure with a 99.9% uptime SLA. Full details are available at /security.",
  "Can I manage multiple ISO standards?":
    "Absolutely. Our Professional and Enterprise plans support all 5 ISO standards simultaneously. ISOComply automatically identifies overlapping controls across standards so you don't duplicate work.",
  "What does it cost?":
    "Pricing is per-user: A$29/user/month for Starter, A$49/user/month for Professional, and A$79/user/month for Enterprise. All plans require a minimum of 5 users. Switch to annual billing and save 20%. Visit our pricing section for full details.",
};

const QUICK_REPLIES = Object.keys(FAQ).slice(0, 4);

const AGENT = {
  name: "Emma",
  title: "AI Compliance Assistant",
  initials: "E",
  photo: "https://i.pravatar.cc/96?img=45",
  from: "from-blue-500",
  to: "to-violet-500",
};

let msgId = 0;
const newMsg = (from: Message["from"], text: string): Message => ({
  id: ++msgId,
  from,
  text,
});

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    newMsg(
      "bot",
      "Hi there! 👋 I'm Emma, ISOComply's virtual AI assistant. I can answer questions about our platform, pricing, and ISO standards. For technical or account-specific queries, our team is always happy to help — just ask!"
    ),
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Show tooltip bubble after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendBotReply = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, newMsg("bot", text)]);
    }, 900 + Math.random() * 600);
  };

  const handleQuickReply = (question: string) => {
    setMessages((prev) => [...prev, newMsg("user", question)]);
    const answer = FAQ[question] ?? "Great question! Let me connect you with our team for a detailed answer.";
    sendBotReply(answer);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, newMsg("user", text)]);

    // Try to match a FAQ
    const matchedKey = Object.keys(FAQ).find((k) =>
      k.toLowerCase().includes(text.toLowerCase().split(" ")[0]) ||
      text.toLowerCase().includes(k.toLowerCase().split(" ")[0])
    );
    if (matchedKey) {
      sendBotReply(FAQ[matchedKey]);
    } else {
      sendBotReply(
        "Thanks for your question! For a detailed answer, I'd recommend booking a live demo where our compliance experts can walk you through ISOComply personally. You can also reach us at support@isocomply.io."
      );
    }
  };

  const shownQuickReplies = QUICK_REPLIES.filter(
    (q) => !messages.some((m) => m.from === "user" && m.text === q)
  );

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Tooltip bubble */}
        {showBubble && !open && (
          <div className="bg-white border border-slate-200 rounded-2xl rounded-br-sm shadow-lg px-4 py-3 max-w-[230px] text-sm text-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => setShowBubble(false)}
              className="absolute top-1.5 right-2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3" />
            </button>
            <p className="font-medium mb-0.5">Hi, I&apos;m {AGENT.name} 👋</p>
            <p className="text-xs text-slate-500">Virtual AI assistant — ask me anything about ISOComply!</p>
          </div>
        )}

        <button
          onClick={() => { setOpen((o) => !o); setShowBubble(false); }}
          className={`size-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 ${
            open ? "bg-slate-700" : "bg-blue-600"
          }`}
        >
          {open ? (
            <X className="size-5 text-white" />
          ) : (
            <MessageCircle className="size-6 text-white" />
          )}
          {/* Unread dot */}
          {!open && (
            <span className="absolute top-0.5 right-0.5 size-3.5 rounded-full bg-emerald-400 border-2 border-white" />
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3.5 flex items-center gap-3 shrink-0">
            <img src={AGENT.photo} alt={AGENT.name} className="size-9 rounded-full object-cover shrink-0 border-2 border-white/20" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{AGENT.name}</p>
                <span className="text-[9px] font-semibold uppercase tracking-wider bg-white/20 text-white/90 rounded px-1.5 py-0.5">Virtual Agent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <p className="text-xs text-blue-100">{AGENT.title}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-white px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.from === "bot" && (
                  <img src={AGENT.photo} alt={AGENT.name} className="size-6 rounded-full object-cover shrink-0 mt-0.5 mr-2" />
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-center gap-2">
                <img src={AGENT.photo} alt={AGENT.name} className="size-6 rounded-full object-cover shrink-0" />
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-slate-400 inline-block"
                      style={{
                        animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick replies */}
            {shownQuickReplies.length > 0 && !typing && (
              <div className="pt-1 flex flex-wrap gap-2">
                {shownQuickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickReply(q)}
                    className="text-xs text-blue-600 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-100 px-3 py-3 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message…"
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-full px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="size-9 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="size-4 text-white" />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
