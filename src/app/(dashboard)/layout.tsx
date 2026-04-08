"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  FileText,
  BarChart3,
  Settings,
  Users,
  ShieldCheck,
  LogOut,
  Bell,
  ChevronDown,
  ClipboardList,
  Check,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  X,
  FlaskConical,
  Building2,
  KeyRound,
  UserCog,
  CreditCard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { PlanProvider, usePlan, type Plan } from "@/lib/plan-context";
import { OrgProvider, useOrg } from "@/lib/org-context";

const navItems = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Standards", href: "/standards", icon: BookOpen },
      { label: "Projects", href: "/projects", icon: FolderOpen },
      { label: "Tasks", href: "/tasks", icon: ClipboardList },
      { label: "Evidence", href: "/evidence", icon: FileText },
      { label: "Gap Analysis", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    group: "Organisation",
    items: [
      { label: "Team", href: "/team", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

// ── Mock notifications ────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    type: "warning" as const,
    title: "3 critical controls unaddressed",
    body: "ISO 27001 gap analysis — A.5.15, A.8.2, A.8.5 are CRITICAL and not in place.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "info" as const,
    title: "Task assigned to you",
    body: "Complete risk assessment documentation — due in 14 days.",
    time: "Yesterday",
    read: false,
  },
  {
    id: 3,
    type: "warning" as const,
    title: "Evidence expiry reminder",
    body: "A.5.1 information security policy document is due for annual review.",
    time: "2 days ago",
    read: false,
  },
  {
    id: 4,
    type: "success" as const,
    title: "ISO 45001 certification ready",
    body: "OH&S Certification Renewal reached 91% — above the 80% threshold.",
    time: "3 weeks ago",
    read: true,
  },
];

const PLAN_CFG: Record<Plan, { label: string; color: string; badge: string; description: string }> = {
  starter:      { label: "Starter",      color: "text-amber-700",  badge: "bg-amber-100 text-amber-700 border-amber-200",   description: "1 ISO standard · up to 5 users" },
  professional: { label: "Professional", color: "text-blue-700",   badge: "bg-blue-100 text-blue-700 border-blue-200",       description: "All 5 standards · up to 20 users" },
  enterprise:   { label: "Enterprise",   color: "text-violet-700", badge: "bg-violet-100 text-violet-700 border-violet-200", description: "Unlimited standards & users" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function OrgName() {
  const org = useOrg();
  return (
    <p className="text-xs text-muted-foreground leading-none mt-0.5">
      {org?.name ?? "Loading…"}
    </p>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">ISOComply</p>
            <OrgName />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

// ── Top bar (needs plan context) ──────────────────────────────────────────────

function TopBar() {
  const { plan, setPlan } = usePlan();
  const { data: session } = useSession();
  const org = useOrg();
  const [notifOpen, setNotifOpen]     = useState(false);
  const [planOpen, setPlanOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen]   = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const isMasterAdmin = session?.user?.email === "admin@isocomply.io";
  const orgName = org?.name ?? (isMasterAdmin ? "Admin" : "…");
  const orgInitials = orgName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "??";
  const displayPlan = isMasterAdmin ? plan : (org?.plan ?? "starter");
  const cfg = PLAN_CFG[displayPlan as Plan] ?? PLAN_CFG.starter;

  const isOrgAdmin = isMasterAdmin || org?.role === "OWNER" || org?.role === "ADMIN";

  const userName  = session?.user?.name ?? session?.user?.email ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userInitials = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const notifRef   = useRef<HTMLDivElement>(null);
  const planRef    = useRef<HTMLDivElement>(null);
  const userRef    = useRef<HTMLDivElement>(null);
  const orgMenuRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close all dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (planRef.current    && !planRef.current.contains(e.target as Node))     setPlanOpen(false);
      if (userRef.current    && !userRef.current.contains(e.target as Node))     setUserMenuOpen(false);
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target as Node))  setOrgMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismiss(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const notifIcon = {
    warning: <AlertTriangle className="size-3.5 text-amber-500" />,
    info:    <Info className="size-3.5 text-blue-500" />,
    success: <CheckCircle2 className="size-3.5 text-emerald-500" />,
  };

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4 sticky top-0 bg-background/95 backdrop-blur z-10">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex-1" />

      {/* Notification bell */}
      <div ref={notifRef} className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => { setNotifOpen((o) => !o); setPlanOpen(false); }}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-blue-600" />
          )}
        </Button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">
                Notifications
                {unread > 0 && (
                  <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">{unread}</span>
                )}
              </p>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-blue-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                  <p className="text-sm text-muted-foreground">All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${n.read ? "opacity-60" : ""}`}>
                    <div className="mt-0.5 shrink-0">{notifIcon[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium text-foreground ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                    <button onClick={() => dismiss(n.id)} className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5">
                      <X className="size-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Plan / org badge — master admin gets a plan switcher, regular users see read-only badge */}
      {isMasterAdmin ? (
        <div ref={planRef} className="relative">
          <button
            onClick={() => { setPlanOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm cursor-pointer hover:bg-muted transition-colors"
          >
            <div className="size-5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
              {orgInitials}
            </div>
            <span className="text-sm font-medium hidden sm:block">{orgName}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
            <span className={`text-[10px] font-semibold h-4 px-1.5 rounded border hidden sm:inline-flex items-center ${cfg.badge}`}>
              {cfg.label}
            </span>
          </button>

          {planOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                <FlaskConical className="size-3.5 text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-700 font-medium">Admin — plan switcher</p>
              </div>
              <div className="p-2">
                {(["starter", "professional", "enterprise"] as Plan[]).map((p) => {
                  const c = PLAN_CFG[p];
                  const active = plan === p;
                  return (
                    <button
                      key={p}
                      onClick={() => { setPlan(p); setPlanOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${active ? "bg-blue-50 border border-blue-200" : "hover:bg-muted"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${c.color}`}>{c.label}</p>
                        <p className="text-[11px] text-muted-foreground">{c.description}</p>
                      </div>
                      {active && <Check className="size-4 text-blue-600 shrink-0" />}
                      {p === "professional" && !active && (
                        <Zap className="size-3.5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="px-4 pb-3 pt-1">
                <p className="text-[10px] text-muted-foreground text-center">
                  Switching plan enforces feature limits across the app
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
          <div className="size-5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
            {orgInitials}
          </div>
          <span className="text-sm font-medium hidden sm:block">{orgName}</span>
          <span className={`text-[10px] font-semibold h-4 px-1.5 rounded border hidden sm:inline-flex items-center ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
      )}

      {/* Org settings button — visible to OWNER and ADMIN only */}
      {isOrgAdmin && (
        <div ref={orgMenuRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            title="Organisation settings"
            onClick={() => { setOrgMenuOpen((o) => !o); setUserMenuOpen(false); setNotifOpen(false); setPlanOpen(false); }}
          >
            <Building2 className="size-4" />
          </Button>

          {orgMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Organisation Settings</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{orgName}</p>
              </div>
              <div className="p-1.5">
                {[
                  { label: "Organisation Profile", href: "/settings", icon: Building2 },
                  { label: "Members & Roles",       href: "/team",     icon: Users },
                  { label: "Subscription & Billing", href: "/settings", icon: CreditCard },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} onClick={() => setOrgMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                    <Icon className="size-4 text-muted-foreground shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User profile avatar button */}
      <div ref={userRef} className="relative">
        <button
          onClick={() => { setUserMenuOpen((o) => !o); setOrgMenuOpen(false); setNotifOpen(false); setPlanOpen(false); }}
          className="size-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center hover:ring-2 hover:ring-blue-300 transition-all focus:outline-none"
          title={userName}
        >
          {userInitials}
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-68 min-w-[260px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            {/* User info header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
              <div className="size-10 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link href="/settings" onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                <UserCog className="size-4 text-muted-foreground shrink-0" />
                Edit Profile
              </Link>
              <Link href="/settings#security" onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                <KeyRound className="size-4 text-muted-foreground shrink-0" />
                Security & MFA
              </Link>
            </div>

            <div className="border-t border-border p-1.5">
              <button
                onClick={() => nextAuthSignOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-4 shrink-0" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrgProvider>
      <PlanProvider>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <TopBar />
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </PlanProvider>
    </OrgProvider>
  );
}
