import Link from "next/link";
import PageLayout from "@/components/landing/page-layout";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    title: "5 Common ISO 27001 Mistakes (and How to Avoid Them)",
    excerpt:
      "After reviewing hundreds of ISO 27001 implementations, we've identified the five mistakes that consistently delay certification — and what to do instead.",
    date: "March 18, 2026",
    author: "Marcus Webb",
    authorRole: "Head of Compliance",
    initials: "MW",
    category: "ISO 27001",
    categoryColor: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    readTime: "7 min read",
  },
  {
    title: "How to Build an Evidence Library That Survives an Audit",
    excerpt:
      "A disorganised evidence vault is one of the top reasons audits fail. Here's our step-by-step guide to structuring your evidence so auditors can find what they need in seconds.",
    date: "February 28, 2026",
    author: "Sophie Brennan",
    authorRole: "VP Customer Success",
    initials: "SB",
    category: "Compliance Tips",
    categoryColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    readTime: "9 min read",
  },
  {
    title: "ISOComply v2.4: ISO 42001 AI Management Support Launched",
    excerpt:
      "We're thrilled to announce full support for ISO 42001:2023 — the world's first standard for AI management systems. Here's what's included and how to get started.",
    date: "March 1, 2026",
    author: "Liam Chen",
    authorRole: "Head of Product",
    initials: "LC",
    category: "Product Updates",
    categoryColor: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    readTime: "4 min read",
  },
  {
    title: "ISO 27001 vs SOC 2: Which Should You Pursue First?",
    excerpt:
      "A question we hear constantly. The answer depends on your customer base, geography, and existing security posture. We break down the key differences to help you decide.",
    date: "February 10, 2026",
    author: "Oliver Hartley",
    authorRole: "CEO & Co-founder",
    initials: "OH",
    category: "ISO 27001",
    categoryColor: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    readTime: "11 min read",
  },
  {
    title: "The CISO's Guide to Continuous Compliance",
    excerpt:
      "Annual audits are a snapshot in time. Continuous compliance means your security posture is always audit-ready. Here's how leading security teams are making the shift.",
    date: "January 22, 2026",
    author: "Marcus Webb",
    authorRole: "Head of Compliance",
    initials: "MW",
    category: "Compliance Tips",
    categoryColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    readTime: "8 min read",
  },
  {
    title: "Managing Multiple ISO Standards Without Losing Your Mind",
    excerpt:
      "Running ISO 27001, ISO 9001, and ISO 14001 simultaneously sounds daunting — but with the right approach, shared controls and overlapping requirements can actually reduce the total work by up to 40%.",
    date: "January 8, 2026",
    author: "Sophie Brennan",
    authorRole: "VP Customer Success",
    initials: "SB",
    category: "Compliance Tips",
    categoryColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    readTime: "6 min read",
  },
];

const categories = ["All", "ISO 27001", "Compliance Tips", "Product Updates"];

export default function BlogPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: "#0a0f1e" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            The ISOComply Blog
          </h1>
          <p className="text-lg text-slate-400">
            Compliance insights, product updates, and ISO guidance from our team of experts.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  i === 0
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.title}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-lg hover:shadow-black/30 transition-all group"
              >
                {/* Colour bar */}
                <div className="h-1 bg-gradient-to-r from-blue-600 to-violet-600" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${post.categoryColor}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                  </div>
                  <h2
                    className="font-bold text-white mb-3 leading-snug group-hover:text-blue-300 transition-colors"
                    style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                        {post.initials}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-300">{post.author}</p>
                        <p className="text-[10px] text-slate-500">{post.date}</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
