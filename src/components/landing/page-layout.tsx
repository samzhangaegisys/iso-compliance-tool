import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoLink } from "@/components/landing/logo-link";

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

export function SiteNav() {
  return (
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
              { label: "Features", href: "/features" },
              { label: "Standards", href: "/#standards" },
              { label: "How It Works", href: "/how-it-works" },
              { label: "Pricing", href: "/#pricing" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/10"
              render={<Link href="/login" />}
            >
              Log in
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white"
              render={<Link href="/register" />}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
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
  );
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
