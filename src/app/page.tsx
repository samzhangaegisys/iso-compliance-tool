"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeroCanvas from "@/components/landing/hero-canvas";
import { HeroDashboard } from "@/components/landing/hero-dashboard";
import { FeatureVisual } from "@/components/landing/feature-visuals";
import { PricingSection } from "@/components/landing/pricing-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { AnimateIn, CountUp } from "@/components/landing/scroll-reveal";
import { LogoLink } from "@/components/landing/logo-link";
import { AnimatedBlob } from "@/components/landing/animated-blob";
import {
  ShieldCheck,
  BarChart3,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Play,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

// ------ Data ----------------------------------------------------------------------------------------------------------------------------------------

const stats = [
  { value: "500+", label: "Organisations certified", accent: true },
  { value: "5", label: "ISO Standards covered", accent: false },
  { value: "114+", label: "Annex A controls mapped", accent: false },
  { value: "98%", label: "Customer satisfaction", accent: true },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Gap Analysis Engine",
    description:
      "Instantly map your current controls against ISO requirements. See exactly where you stand and what needs attention.",
    bullets: [
      "Visual compliance heatmap",
      "Priority-ranked gaps",
      "Cross-standard overlap detection",
    ],
  },
  {
    icon: FileCheck2,
    title: "Evidence Vault",
    description:
      "Centralise all your compliance evidence. Upload documents, screenshots, and policies — linked directly to controls.",
    bullets: [
      "Drag-and-drop uploads",
      "Version history",
      "Auto-expiry reminders",
    ],
  },
  {
    icon: BarChart3,
    title: "Audit Report Generator",
    description:
      "Generate professional audit reports in seconds. Impress auditors with clear, structured evidence packages.",
    bullets: [
      "One-click PDF export",
      "Customisable templates",
      "Auditor sharing links",
    ],
  },
];

const standards = [
  {
    code: "ISO 27001",
    year: "2022",
    name: "Information Security Management",
    description:
      "The world's leading standard for information security management systems. Protect data, manage risks, and demonstrate security commitment.",
    stat: "114 controls",
  },
  {
    code: "ISO 9001",
    year: "2015",
    name: "Quality Management System",
    description:
      "The internationally recognised standard for quality management. Improve processes, increase efficiency, and enhance customer satisfaction.",
    stat: "10 clauses",
  },
  {
    code: "ISO 14001",
    year: "2015",
    name: "Environmental Management",
    description:
      "A framework for managing environmental responsibilities. Reduce environmental impact and demonstrate sustainability commitment.",
    stat: "6 clauses",
  },
  {
    code: "ISO 45001",
    year: "2018",
    name: "Occupational Health & Safety",
    description:
      "The global standard for occupational health and safety management. Prevent work-related injuries, illnesses, and fatalities.",
    stat: "10 clauses",
  },
  {
    code: "ISO 42001",
    year: "2023",
    name: "AI Management System",
    description:
      "The first international standard for AI management systems. Govern AI responsibly with accountability, transparency, and risk management.",
    stat: "9 clauses",
  },
];

const steps = [
  {
    number: "01",
    title: "Import & Assess",
    description:
      "Connect your organisation, select your ISO standards, and run your first gap analysis in minutes.",
  },
  {
    number: "02",
    title: "Implement & Evidence",
    description:
      "Work through controls systematically. Assign tasks, upload evidence, and track progress in real time.",
  },
  {
    number: "03",
    title: "Report & Certify",
    description:
      "Generate your audit pack, share with your certification body, and achieve certification with confidence.",
  },
];

const testimonials = [
  {
    quote: "ISOComply cut our ISO 27001 preparation time in half. The gap analysis alone saved us weeks of spreadsheet work.",
    name: "Sarah Mitchell",
    role: "CISO",
    company: "Nexus Corp",
  },
  {
    quote: "Managing 3 ISO standards simultaneously used to be a nightmare. Now it's genuinely manageable with ISOComply.",
    name: "James Chen",
    role: "Quality Manager",
    company: "BlueSky Tech",
  },
  {
    quote: "The audit report generator is exceptional. Our auditors were genuinely impressed by the quality of the evidence package.",
    name: "Emma Roberts",
    role: "Compliance Lead",
    company: "Vertex Group",
  },
  {
    quote: "We achieved ISO 9001 certification in just 4 months. What used to take over a year now takes a quarter.",
    name: "David Park",
    role: "Operations Director",
    company: "Meridian Health",
  },
  {
    quote: "The evidence vault is a game changer. No more hunting through shared drives when auditors come knocking.",
    name: "Lisa Thompson",
    role: "Head of Compliance",
    company: "Apex Systems",
  },
  {
    quote: "Our ISO 42001 AI management certification would have been impossible without ISOComply's structured approach.",
    name: "Michael Obi",
    role: "AI Governance Lead",
    company: "Orion Digital",
  },
  {
    quote: "Task assignment and real-time tracking keeps the whole team aligned. Compliance is no longer just one person's job.",
    name: "Rachel Kim",
    role: "GRC Manager",
    company: "Stratos Finance",
  },
  {
    quote: "Real-time audit trail and evidence linking saved us 3 full days of manual work before our annual ISO review.",
    name: "Tom Davies",
    role: "IT Security Manager",
    company: "Pinnacle Group",
  },
];


const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Standards", href: "/#standards" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API", href: "/api-docs" },
    { label: "Status", href: "/status" },
    { label: "Security", href: "/security" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
    { label: "DPA", href: "/dpa" },
  ],
};

// ------ TypewriterText component -----------------------------------------------------------------------------------------------------------

function TypewriterText() {
  const phrases = [
    "AI-powered gap analysis in minutes.",
    "Know exactly where you stand.",
    "Turn gaps into tasks automatically.",
    "Get audit-ready faster than ever.",
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx];
    if (!deleting && displayed.length < phrase.length) {
      const t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === phrase.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }
  }, [displayed, deleting, phraseIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="text-blue-400">
      {displayed}
      <span
        className="inline-block w-0.5 h-5 bg-blue-400 ml-0.5 align-middle"
        style={{ animation: "blink 1s step-end infinite" }}
      />
    </span>
  );
}

// ------ Sub-components ----------------------------------------------------------------------------------------------------------------------

function DashboardMockup() {
  const sidebarItems = [
    "Dashboard",
    "Gap Analysis",
    "Evidence Vault",
    "Controls",
    "Reports",
    "Team",
    "Settings",
  ];
  const controls = [
    { id: "A.5.1", name: "Information security policies", status: "Implemented", pct: 100 },
    { id: "A.6.1", name: "Internal organisation", status: "In Progress", pct: 65 },
    { id: "A.7.1", name: "Human resource security", status: "In Progress", pct: 40 },
    { id: "A.8.1", name: "Asset management", status: "Not Started", pct: 0 },
    { id: "A.9.1", name: "Access control", status: "Implemented", pct: 100 },
    { id: "A.10.1", name: "Cryptography", status: "In Progress", pct: 72 },
    { id: "A.11.1", name: "Physical security", status: "Implemented", pct: 100 },
    { id: "A.12.1", name: "Operations security", status: "Not Started", pct: 15 },
  ];
  return (
    <div className="relative rounded-xl border border-slate-700/60 bg-slate-900 overflow-hidden shadow-2xl shadow-blue-900/20">
      {/* Browser chrome */}
      <div className="bg-slate-800 px-4 py-3 flex items-center gap-3 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-red-500/70" />
          <div className="size-3 rounded-full bg-yellow-500/70" />
          <div className="size-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-slate-700 rounded-md px-4 py-1 text-xs text-slate-400 w-56 text-center">
            app.isocomply.io/dashboard
          </div>
        </div>
      </div>
      {/* App layout */}
      <div className="flex h-[420px]">
        {/* Sidebar */}
        <div className="w-44 bg-slate-950 border-r border-slate-800 flex flex-col py-4 shrink-0">
          <div className="flex items-center gap-2 px-4 mb-6">
            <ShieldCheck className="size-5 text-blue-500" />
            <span className="text-xs font-bold text-white">ISOComply</span>
          </div>
          <nav className="flex flex-col gap-0.5 px-2">
            {sidebarItems.map((item, i) => (
              <div
                key={item}
                className={`px-3 py-1.5 rounded-md text-xs ${
                  i === 0
                    ? "bg-blue-600/20 text-blue-400 font-medium"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </div>
        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-900">
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Compliance Dashboard</p>
              <p className="text-[10px] text-slate-500">ISO 27001:2022 · Last updated today</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                68% Complete
              </div>
            </div>
          </div>
          {/* Score cards */}
          <div className="px-4 py-3 grid grid-cols-4 gap-2.5">
            {[
              { label: "ISO 27001", pct: 68, color: "bg-blue-500" },
              { label: "ISO 9001", pct: 84, color: "bg-emerald-500" },
              { label: "ISO 14001", pct: 42, color: "bg-amber-500" },
              { label: "ISO 45001", pct: 91, color: "bg-violet-500" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/50"
              >
                <p className="text-[10px] text-slate-400 mb-0.5">{item.label}</p>
                <p className="text-lg font-bold text-white leading-tight">{item.pct}%</p>
                <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Controls table */}
          <div className="px-4 pb-3 flex-1 overflow-hidden">
            <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Recent Controls
            </p>
            <div className="rounded-lg border border-slate-700/50 overflow-hidden">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700/50">
                    <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium">Control</th>
                    <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium hidden sm:table-cell">Name</th>
                    <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {controls.map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? "bg-slate-900" : "bg-slate-850"}>
                      <td className="px-2.5 py-1.5 text-blue-400 font-mono font-medium">{c.id}</td>
                      <td className="px-2.5 py-1.5 text-slate-300 hidden sm:table-cell">{c.name}</td>
                      <td className="px-2.5 py-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            c.status === "Implemented"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : c.status === "In Progress"
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-slate-500/15 text-slate-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------ TestimonialsSection -----------------------------------------------------------------------------------------------------------------------

function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const featured = testimonials.slice(0, 5);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % featured.length), 6000);
    return () => clearInterval(id);
  }, [featured.length]);

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: "#06090f" }}>
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(99,102,241,0.8) 59px, rgba(99,102,241,0.8) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(99,102,241,0.8) 59px, rgba(99,102,241,0.8) 60px)",
        }}
      />
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.08) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 items-start">

          {/* Left — label + navigation tabs */}
          <div className="lg:pt-2">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-5">
              Customer stories
            </p>
            <h2
              className="text-3xl lg:text-4xl font-bold text-white mb-10 leading-tight"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Trusted by compliance professionals worldwide
            </h2>

            <div className="space-y-1">
              {featured.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-3 group"
                  style={{
                    background: i === active ? "rgba(59,130,246,0.08)" : "transparent",
                    border: i === active ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                  }}
                >
                  <div
                    className="size-1.5 rounded-full shrink-0 transition-all duration-200"
                    style={{ background: i === active ? "#60a5fa" : "rgba(100,116,139,0.4)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold transition-colors duration-200 truncate"
                      style={{ color: i === active ? "#f1f5f9" : "#64748b" }}
                    >
                      {t.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: i === active ? "#60a5fa" : "#475569" }}>
                      {t.role} · {t.company}
                    </p>
                  </div>
                  {i === active && (
                    <ChevronRight className="size-4 text-blue-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="flex gap-1.5 mt-8">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="h-0.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === active ? "2rem" : "1rem",
                    background: i === active ? "#60a5fa" : "rgba(100,116,139,0.3)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right — quote display */}
          <div className="relative min-h-[280px] flex items-center">
            {/* Large decorative quote mark */}
            <span
              className="absolute -top-4 -left-2 select-none pointer-events-none font-bold leading-none"
              style={{
                fontSize: "140px",
                fontFamily: "var(--font-jakarta), sans-serif",
                color: "rgba(59,130,246,0.12)",
                lineHeight: 1,
              }}
            >
              &ldquo;
            </span>

            {featured.map((t, i) => (
              <div
                key={i}
                className="transition-all duration-500 w-full"
                style={{
                  opacity: i === active ? 1 : 0,
                  transform: i === active ? "translateY(0)" : "translateY(10px)",
                  position: i === active ? "relative" : "absolute",
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                <blockquote
                  className="text-xl lg:text-2xl text-slate-200 leading-relaxed mb-10"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 300 }}
                >
                  {t.quote}
                </blockquote>

                <div className="flex items-center gap-4">
                  <div
                    className="size-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #7c3aed)" }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-white"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {t.name}
                    </p>
                    <p className="text-sm text-slate-400">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

// ------ Page ------------------------------------------------------------------------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      {/* ---- Navigation ---------------------------------------------------------------------------------------------------------------- */}
      <nav
        className="sticky top-0 z-50 border-b border-white/5"
        style={{
          background: "rgba(10,15,30,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <LogoLink />
            <div className="hidden md:flex items-center gap-7 text-sm">
              {[
                { label: "Features", href: "#features" },
                { label: "Standards", href: "#standards" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Pricing", href: "#pricing" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-white/10"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ---- Hero -------------------------------------------------------------------------------------------------------------------------------- */}
      <section
        className="relative flex flex-col min-h-[calc(100dvh-4rem)]"
        style={{ backgroundColor: "#0a0f1e", overflow: "clip" }}
      >
        {/* Animated blobs */}
        <AnimatedBlob className="w-96 h-96 bg-blue-600/20 top-20 left-1/4" style={{ animationDelay: "0s" }} />
        <AnimatedBlob className="w-80 h-80 bg-violet-600/15 top-40 right-1/4" style={{ animationDelay: "2s" }} />
        <AnimatedBlob className="w-64 h-64 bg-cyan-500/10 bottom-20 left-1/3" style={{ animationDelay: "4s" }} />

        {/* Animated particle network canvas */}
        <HeroCanvas />
        {/* Animated gradient blob */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(30,27,75,0.7) 0%, rgba(10,15,30,0.6) 30%, rgba(15,23,42,0.7) 50%, rgba(26,16,64,0.7) 70%, rgba(10,15,30,0.6) 100%)",
            backgroundSize: "300% 300%",
            animation: "gradient-shift 12s ease infinite",
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(99,102,241,0.5) 39px, rgba(99,102,241,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(99,102,241,0.5) 39px, rgba(99,102,241,0.5) 40px)",
          }}
        />
        {/* Radial accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />

        {/* ── Centered text + CTA ────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 pt-16 pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-7">
            <Sparkles className="size-4 text-violet-400" />
            AI-powered · No spreadsheets · No consultants
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight text-white leading-[1.05] mb-2 max-w-4xl"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            ISO Compliance,
          </h1>
          <h1
            className="text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight leading-[1.05] mb-6 max-w-4xl"
            style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              background: "linear-gradient(90deg, #60a5fa, #a78bfa, #67e8f9, #60a5fa)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
            }}
          >
            On Autopilot.
          </h1>

          <p className="text-lg text-slate-400 mb-3 max-w-2xl leading-relaxed">
            Skip the expensive consultants and endless spreadsheets.
            ISOComply&apos;s AI maps your controls, builds your evidence vault,
            and gets you audit-ready in weeks — not months.
          </p>
          <p className="text-blue-400 text-sm mb-8 min-h-[20px]">
            <TypewriterText />
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 text-base font-semibold"
                style={{ animation: "glow-btn 3s ease-in-out infinite" }}
              >
                Get Started
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-white/5 h-12 px-8 text-base">
                <Play className="mr-2 size-4" />
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Lock, label: "SOC 2 Type II" },
              { icon: ShieldCheck, label: "GDPR Ready" },
              { icon: Lock, label: "256-bit Encryption" },
              { icon: CheckCircle2, label: "99.9% Uptime" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <badge.icon className="size-3.5 text-blue-400" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Wide interactive dashboard ──────────────────────────────── */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-0">
          <HeroDashboard />
        </div>
      </section>

      {/* ---- Social proof logos -------------------------------------------------------------------------------------------------- */}
      <section className="py-14 bg-slate-950 border-y border-white/5">
        <p className="text-center text-xs font-medium text-slate-500 uppercase tracking-widest mb-10">
          Trusted by compliance teams at leading organisations
        </p>
        {(() => {
          const logos: { name: string; svg: React.ReactNode }[] = [
            {
              name: "Microsoft",
              svg: (
                <svg width="120" height="26" viewBox="0 0 120 26" fill="none" aria-label="Microsoft">
                  <rect x="0" y="0" width="11" height="11" fill="currentColor" opacity="0.55" />
                  <rect x="13" y="0" width="11" height="11" fill="currentColor" opacity="0.4" />
                  <rect x="0" y="13" width="11" height="11" fill="currentColor" opacity="0.4" />
                  <rect x="13" y="13" width="11" height="11" fill="currentColor" opacity="0.55" />
                  <text x="30" y="19" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="14" fontWeight="300" fill="currentColor" letterSpacing="0.3">Microsoft</text>
                </svg>
              ),
            },
            {
              name: "Amazon",
              svg: (
                <svg width="90" height="26" viewBox="0 0 90 26" fill="none" aria-label="Amazon">
                  <text x="0" y="18" fontFamily="'Amazon Ember', Arial, sans-serif" fontSize="16" fontWeight="500" fill="currentColor">amazon</text>
                  <path d="M2 22 Q34 28 62 22" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
                  <polygon points="60,19 64,22 60,25" fill="currentColor" opacity="0.7" />
                </svg>
              ),
            },
            {
              name: "IBM",
              svg: (
                <svg width="48" height="26" viewBox="0 0 48 26" fill="none" aria-label="IBM">
                  <text x="0" y="20" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="800" fill="currentColor" letterSpacing="2">IBM</text>
                </svg>
              ),
            },
            {
              name: "Deloitte",
              svg: (
                <svg width="82" height="26" viewBox="0 0 82 26" fill="none" aria-label="Deloitte">
                  <text x="0" y="19" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="400" fill="currentColor">deloitte</text>
                  <circle cx="79" cy="15" r="3" fill="currentColor" opacity="0.9" />
                </svg>
              ),
            },
            {
              name: "Accenture",
              svg: (
                <svg width="110" height="26" viewBox="0 0 110 26" fill="none" aria-label="Accenture">
                  <text x="0" y="19" fontFamily="'Graphik', Arial, sans-serif" fontSize="16" fontWeight="400" fill="currentColor">accenture</text>
                  <polygon points="104,5 110,13 104,21" fill="currentColor" opacity="0.85" />
                </svg>
              ),
            },
            {
              name: "Cisco",
              svg: (
                <svg width="56" height="26" viewBox="0 0 56 26" fill="none" aria-label="Cisco">
                  {[0,8,16,24,32,40,48].map((x, i) => (
                    <rect key={i} x={x} y={i < 3 || i > 3 ? 10 : 6} width="5" height={i < 3 || i > 3 ? 10 : 14} rx="2" fill="currentColor" opacity={i === 3 ? 0.9 : 0.5} />
                  ))}
                </svg>
              ),
            },
          ];
          const doubled = [...logos, ...logos];
          return (
            <div className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
              <div
                className="flex items-center"
                style={{
                  animation: "marquee 24s linear infinite",
                  width: "max-content",
                  willChange: "transform",
                }}
              >
                {doubled.map((logo, i) => (
                  <div
                    key={i}
                    className="px-12 py-2 text-slate-500 hover:text-slate-300 transition-colors duration-300 whitespace-nowrap"
                  >
                    {logo.svg}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ---- Stats -------------------------------------------------------------------------------------------------------------------------- */}
      <section className="py-24" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/10">
            {[
              { to: 500, suffix: "+", label: "Organisations certified" },
              { to: 5, suffix: "", label: "ISO Standards covered" },
              { to: 114, suffix: "+", label: "Annex A controls mapped" },
              { to: 98, suffix: "%", label: "Customer satisfaction" },
            ].map((stat, i) => (
              <AnimateIn key={stat.label} delay={i * 100} className="text-center px-6 group">
                <p
                  className="text-5xl lg:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    fontFamily: "var(--font-jakarta), sans-serif",
                    background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  <CountUp to={stat.to} suffix={stat.suffix} />
                </p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features -------------------------------------------------------------------------------------------------------------------- */}
      <section id="features" className="py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn className="text-center mb-20">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Everything you need to get certified
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From day-one gap assessment to audit day, ISOComply manages your
              entire compliance journey
            </p>
          </AnimateIn>

          <div className="flex flex-col gap-16">
            {features.map((feature, i) => (
              <AnimateIn
                key={feature.title}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={100}
              >
              <div
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Text with beam sweep card */}
                <div className="flex-1">
                  <div className="relative overflow-hidden group/card rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-500">
                    {/* Beam sweep on hover */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover/card:translate-x-[300%] transition-transform duration-700 skew-x-[-15deg] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                    <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-blue-600/15 border border-blue-500/20 mb-5">
                      <feature.icon className="size-7 text-blue-400" />
                    </div>
                    <h3
                      className="text-2xl font-bold text-white mb-4"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-3 text-slate-300">
                          <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Animated feature visual */}
                <div className="flex-1 w-full">
                  <FeatureVisual index={i} />
                </div>
              </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ---- AI Advisor ------------------------------------------------------------------------------------------------------------ */}
      <section id="ai-advisor" className="py-28" style={{ background: "linear-gradient(135deg, #0f0a1e 0%, #0a0f1e 50%, #0e0a1e 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-6">
              <Sparkles className="size-4 text-violet-400" />
              AI-Powered Guidance
            </div>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Meet your AI Compliance Advisor
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Don't know where to start? Just ask. Our AI advisor knows every ISO control
              inside out — it guides you through implementation, tells you what evidence auditors
              expect, and prioritises your gaps so you always know what to do next.
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* AI capabilities */}
            <AnimateIn direction="left" delay={100}>
              <div className="space-y-4">
                {[
                  {
                    icon: "🎯",
                    title: "Step-by-step implementation guidance",
                    body: "For any ISO control, the AI breaks down exactly what you need to do — in plain English, with no compliance jargon.",
                  },
                  {
                    icon: "📋",
                    title: "Evidence coaching",
                    body: "Know exactly what documents, screenshots, and records your auditor will ask for — before they ask.",
                  },
                  {
                    icon: "⚡",
                    title: "Prioritised gap analysis",
                    body: "The AI ranks your gaps by risk and effort so you tackle critical issues first and get audit-ready faster.",
                  },
                  {
                    icon: "💬",
                    title: "Ask anything, 24/7",
                    body: "\"How do I implement MFA?\", \"What's an ISMS policy?\" — get instant, expert answers any time.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/8 transition-colors">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateIn>

            {/* AI chat mockup */}
            <AnimateIn direction="right" delay={200}>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900 overflow-hidden shadow-2xl shadow-violet-900/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-900/60 to-blue-900/60 px-4 py-3 border-b border-slate-700 flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">AI Compliance Advisor</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Online · ISO 27001 · A.8.5
                    </p>
                  </div>
                </div>
                {/* Chat messages */}
                <div className="p-4 space-y-3 min-h-[260px]">
                  <div className="flex gap-2">
                    <div className="size-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-[10px]">AI</span>
                    </div>
                    <div className="bg-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 max-w-[85%] leading-relaxed">
                      I see you're looking at <span className="font-semibold text-violet-300">A.8.5 — Secure Authentication</span> (Critical risk). What would you like help with?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-600 rounded-xl px-3 py-2 text-xs text-white max-w-[80%]">
                      How do I implement MFA for our remote workers?
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="size-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-[10px]">AI</span>
                    </div>
                    <div className="bg-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 max-w-[85%] leading-relaxed">
                      <span className="font-semibold text-white">MFA rollout — step by step:</span><br />
                      1. Enable MFA in your IdP (Azure AD, Okta, or Google Workspace)<br />
                      2. Enforce it on VPN + critical SaaS first<br />
                      3. Communicate to staff with a 2-week notice<br />
                      4. Export enrollment report as audit evidence ✅
                    </div>
                  </div>
                  {/* Quick question chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["What evidence do I need?", "How long does this take?", "What tools help?"].map((q) => (
                      <span key={q} className="text-[10px] px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 cursor-pointer">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Input */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-500">
                    Ask anything about ISO compliance…
                  </div>
                  <div className="size-8 rounded-xl bg-violet-600 flex items-center justify-center">
                    <span className="text-white text-xs">→</span>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ---- ISO Standards ---------------------------------------------------------------------------------------------------------- */}
      <section id="standards" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-5"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Comprehensive ISO Framework Coverage
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              One platform for all your ISO compliance needs. Identify shared
              controls and reduce duplication.
            </p>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {standards.map((std, i) => (
              <AnimateIn key={std.code} delay={i * 80} direction="up">
              <div
                key={std.code}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 mb-2">
                      {std.code}:{std.year}
                    </span>
                    <h3
                      className="font-bold text-slate-900"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {std.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  {std.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                    {std.stat}
                  </span>
                  <a
                    href="#"
                    className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                  >
                    Learn more <ChevronRight className="size-3.5" />
                  </a>
                </div>
              </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How It Works ------------------------------------------------------------------------------------------------------------ */}
      <section
        id="how-it-works"
        className="py-28"
        style={{ backgroundColor: "#0a0f1e" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Get audit-ready in 3 steps
            </h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dotted connector line */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)]"
              style={{
                height: "1px",
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(99,102,241,0.5) 0, rgba(99,102,241,0.5) 6px, transparent 6px, transparent 14px)",
              }}
            />
            {steps.map((step, i) => (
              <AnimateIn key={step.number} delay={i * 150} direction="up">
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center size-20 rounded-2xl border border-blue-500/30 bg-blue-600/10 mb-6 relative">
                  {/* Pulsing gradient background behind number */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
                      animation: "pulse-glow 2s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="text-3xl font-bold text-blue-400 relative z-10"
                    style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Testimonials ------------------------------------------------------------------------------------------------------------ */}
      <TestimonialsSection />

      {/* ---- Comparison ---------------------------------------------------------------------------------------------------------------- */}
      <ComparisonSection />

      {/* ---- Pricing ---------------------------------------------------------------------------------------------------------------------- */}
      <PricingSection />

      {/* ---- CTA Banner ---------------------------------------------------------------------------------------------------------------- */}
      <section
        className="relative overflow-hidden py-28"
        style={{ backgroundColor: "#0a0f1e" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, #1e1b4b 0%, #0a0f1e 40%, #0c1a3a 70%, #0a0f1e 100%)",
            backgroundSize: "300% 300%",
            animation: "gradient-shift 10s ease infinite",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />
        <AnimateIn className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative group">
            {/* Rotating gradient border */}
            <div
              className="absolute -inset-[1px] rounded-3xl opacity-70 group-hover:opacity-100 transition-opacity"
              style={{
                background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)",
                animation: "spin-slow 4s linear infinite",
                filter: "blur(1px)",
              }}
            />
            <div className="relative rounded-3xl bg-slate-900 p-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <ShieldCheck className="size-3.5" />
                Trusted by 500+ organisations
              </div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Compliance that works as
                <br />
                <span style={{ background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  hard as you do
                </span>
              </h2>
              <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
                From first gap assessment to audit day, ISOComply keeps your
                entire compliance programme on track — automated, auditable, and always up to date.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-10 text-base font-semibold"
                    style={{ animation: "glow-btn 3s ease-in-out infinite" }}
                  >
                    Get Started
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-white/5 h-12 px-8 text-base">
                    Book a Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* ---- Footer ------------------------------------------------------------------------------------------------------------------------ */}
      <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="size-6 text-blue-500" />
                <span
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  ISOComply
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The intelligent ISO compliance platform
              </p>
            </div>
            {/* Link columns */}
            {Object.entries(footerLinks).map(([col, links]) => (
              <div key={col}>
                <p
                  className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  {col}
                </p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} ISOComply Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-xs text-slate-600">
              <a href="#" className="hover:text-slate-400 transition-colors">X&nbsp;(Twitter)</a>
              <a href="#" className="hover:text-slate-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-slate-400 transition-colors flex items-center gap-1">
                GitHub <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
