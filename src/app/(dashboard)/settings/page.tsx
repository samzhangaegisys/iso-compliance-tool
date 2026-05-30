"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2, Shield, CreditCard, Check, AlertCircle, User, Lock, Sparkles, Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MFASection } from "@/components/dashboard/mfa-section";
import { useOrg } from "@/lib/org-context";

type SaveStatus = "idle" | "saving" | "saved" | "error";

function SaveFeedback({ status }: { status: SaveStatus }) {
  if (status === "idle")    return null;
  if (status === "saving")  return <span className="text-xs text-muted-foreground">Saving…</span>;
  if (status === "saved")   return <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="size-3" /> Saved</span>;
  return <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="size-3" /> Failed to save</span>;
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [profileStatus, setProfileStatus] = useState<SaveStatus>("idle");

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew,     setPwNew]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwStatus,  setPwStatus]  = useState<SaveStatus>("idle");
  const [pwError,   setPwError]   = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setName(d.user.name  ?? "");
          setEmail(d.user.email ?? "");
          setPhone(d.user.phone ?? "");
        }
      })
      .catch(() => {});
  }, []);

  async function handleProfileSave() {
    setProfileStatus("saving");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error();
      setProfileStatus("saved");
      setTimeout(() => setProfileStatus("idle"), 3000);
    } catch {
      setProfileStatus("error");
      setTimeout(() => setProfileStatus("idle"), 3000);
    }
  }

  async function handlePasswordChange() {
    setPwError("");
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwError("All fields are required."); return; }
    if (pwNew !== pwConfirm) { setPwError("New passwords do not match."); return; }
    if (pwNew.length < 8)   { setPwError("Password must be at least 8 characters."); return; }
    setPwStatus("saving");
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPwError(data.error ?? "Failed to change password.");
        setPwStatus("error");
        return;
      }
      setPwStatus("saved");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
      setTimeout(() => setPwStatus("idle"), 3000);
    } catch {
      setPwStatus("error");
      setTimeout(() => setPwStatus("idle"), 3000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-4" /> Personal Information
          </CardTitle>
          <CardDescription>Your name and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email address</Label>
              <Input value={email} disabled className="bg-muted/60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <Label>Phone number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+61 400 000 000" />
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleProfileSave} disabled={profileStatus === "saving"}>
              Save changes
            </Button>
            <SaveFeedback status={profileStatus} />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4" /> Security
          </CardTitle>
          <CardDescription>Two-factor authentication and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MFASection />
          <Separator />
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5"><Lock className="size-3.5" /> Change password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
            <div className="space-y-2 max-w-sm">
              <Input type="password" placeholder="Current password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} />
              <Input type="password" placeholder="New password (min 8 characters)" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
              <Input type="password" placeholder="Confirm new password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
            </div>
            {pwError && (
              <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="size-3" /> {pwError}</p>
            )}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handlePasswordChange} disabled={pwStatus === "saving"}>
                Update password
              </Button>
              <SaveFeedback status={pwStatus} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Organisation tab ──────────────────────────────────────────────────────────

function OrgTab() {
  const org = useOrg();
  const isAdmin = org?.role === "OWNER" || org?.role === "ADMIN";

  const [orgName, setOrgName] = useState(org?.name ?? "");
  const [orgSlug, setOrgSlug] = useState(org?.slug ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (org?.name && orgName === "") { setOrgName(org.name); setOrgSlug(org.slug ?? ""); }
  }, [org]);

  async function handleSave() {
    if (!orgName.trim() || !orgSlug.trim()) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/org/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim(), slug: orgSlug.trim() }),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Building2 className="size-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Organisation settings are managed by Owners and Admins.</p>
          <p className="text-xs mt-1">Contact your workspace owner to make changes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="size-4" /> Organisation
        </CardTitle>
        <CardDescription>Update your organisation details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Organisation name</Label>
          <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Your organisation name" />
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="your-org-slug"
          />
          <p className="text-xs text-muted-foreground">Used in URLs. Only lowercase letters, numbers, and hyphens.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave} disabled={saveStatus === "saving"}>
            Save changes
          </Button>
          <SaveFeedback status={saveStatus} />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Branding tab (Pro+ only) ─────────────────────────────────────────────────

function BrandingTab() {
  const org = useOrg();
  const isAdmin = org?.role === "OWNER" || org?.role === "ADMIN";
  const isPro = org?.plan === "professional" || org?.plan === "enterprise";

  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [thresholdsStr, setThresholdsStr] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!org) return;
    setLogoUrl(org.logoUrl ?? "");
    setPrimaryColor(org.brandingPrimaryColor ?? "");
    setDisplayName(org.brandingDisplayName ?? "");
    setThresholdsStr((org.expiryThresholds ?? [30]).join(", "));
  }, [org]);

  async function handleSave() {
    setError(null);
    if (primaryColor && !/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      setError("Primary colour must be a 6-digit hex (e.g. #2563eb)");
      return;
    }
    if (logoUrl && !/^https?:\/\//.test(logoUrl)) {
      setError("Logo URL must start with http:// or https://");
      return;
    }
    let thresholds: number[] | undefined;
    if (thresholdsStr.trim()) {
      const parts = thresholdsStr.split(",").map((s) => Number.parseInt(s.trim(), 10));
      if (parts.some((n) => !Number.isFinite(n) || n < 1 || n > 365)) {
        setError("Expiry thresholds must be integers 1–365 (days before)");
        return;
      }
      thresholds = Array.from(new Set(parts)).sort((a, b) => b - a);
    }
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/org/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: logoUrl || null,
          brandingPrimaryColor: primaryColor || null,
          brandingDisplayName: displayName || null,
          expiryThresholds: thresholds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
        return;
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setError("Network error");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Palette className="size-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Branding is managed by Owners and Admins.</p>
        </CardContent>
      </Card>
    );
  }
  if (!isPro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-4 text-blue-500" /> Branded reports
          </CardTitle>
          <CardDescription>Add your logo, colour scheme, and custom display name to audit reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm space-y-2">
            <p className="font-semibold text-blue-900">Available on Professional and Enterprise</p>
            <p className="text-blue-700">
              Upgrade to brand your audit reports with your organisation&apos;s logo and colours,
              and configure multi-threshold evidence expiry alerts.
            </p>
            <Button
              size="sm"
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => (window.location.href = "/settings?tab=billing")}
            >
              View upgrade options
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="size-4" /> Branding & alerts
        </CardTitle>
        <CardDescription>Customise how your organisation appears on audit reports and configure evidence expiry alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label>Logo URL</Label>
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
          <p className="text-xs text-muted-foreground">Publicly accessible PNG/SVG. We don&apos;t host the logo — paste a URL to where it&apos;s already hosted.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Primary colour</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primaryColor || "#2563eb"}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-9 w-12 rounded border border-border cursor-pointer"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#2563eb"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">Used for report headers, dividers, and section accents.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Display name on reports</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={org?.name ?? "Your organisation"}
          />
          <p className="text-xs text-muted-foreground">Overrides the workspace name on PDF covers. Leave blank to use {org?.name ?? "the workspace name"}.</p>
        </div>
        <Separator />
        <div className="space-y-1.5">
          <Label>Evidence expiry alert thresholds (days before)</Label>
          <Input
            value={thresholdsStr}
            onChange={(e) => setThresholdsStr(e.target.value)}
            placeholder="60, 30, 7"
          />
          <p className="text-xs text-muted-foreground">Comma-separated days before expiry to surface alerts. Pro: up to 5 entries; Enterprise: up to 10.</p>
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="size-3.5" /> {error}
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave} disabled={saveStatus === "saving"}>
            Save branding
          </Button>
          <SaveFeedback status={saveStatus} />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Billing tab ───────────────────────────────────────────────────────────────

const PLAN_DETAILS: Record<string, { label: string; description: string; price: string }> = {
  professional: { label: "Professional", description: "Unlimited projects, users & AI Advisor queries · branded reports", price: "A$49/user/mo" },
  enterprise:   { label: "Enterprise",   description: "Pro features + SSO, custom API, on-prem & 99.9% SLA",                price: "A$79/user/mo" },
};

function BillingTab() {
  const org = useOrg();
  const isOwner = org?.role === "OWNER";
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setUpgradeError(data.error ?? "Could not open billing portal.");
      }
    } catch {
      setUpgradeError("Something went wrong. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleUpgrade(plan: string) {
    setUpgrading(plan);
    setUpgradeError("");
    try {
      const profileRes = await fetch("/api/user/profile");
      const { user } = await profileRes.json();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          email: user?.email ?? "",
          userId: user?.id ?? "",
          successUrl: `${window.location.origin}/settings?tab=billing&upgraded=1`,
          cancelUrl: `${window.location.origin}/settings?tab=billing`,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setUpgradeError(data.error ?? "Failed to start checkout"); setUpgrading(null); return; }
      if (data.devMode) {
        setUpgradeError("Payment not configured — contact support to upgrade.");
        setUpgrading(null);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setUpgradeError("Something went wrong. Please try again.");
      setUpgrading(null);
    }
  }

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <CreditCard className="size-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Billing is managed by the workspace Owner.</p>
          <p className="text-xs mt-1">Contact your workspace owner to change the plan.</p>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = org?.plan ?? "starter";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="size-4" /> Subscription & Billing
        </CardTitle>
        <CardDescription>Manage your plan and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
          <div>
            <p className="text-sm font-semibold capitalize">{currentPlan} Plan</p>
            <p className="text-xs text-muted-foreground">
              {currentPlan === "enterprise"
                ? "Unlimited standards & users"
                : currentPlan === "professional"
                  ? "All 5 standards · up to 20 users"
                  : "All 5 standards · up to 2 projects · 5 users"}
            </p>
          </div>
          <Badge className="capitalize">{currentPlan}</Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={portalLoading}
          onClick={handleManageBilling}
        >
          {portalLoading ? "Opening…" : "Manage billing"}
        </Button>

        {currentPlan !== "enterprise" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available upgrades</p>
            {Object.entries(PLAN_DETAILS)
              .filter(([key]) => key !== currentPlan)
              .map(([key, plan]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-semibold">{plan.label}</p>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{plan.price}</span>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={upgrading === key}
                      onClick={() => handleUpgrade(key)}
                    >
                      {upgrading === key ? "Loading…" : "Upgrade"}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {upgradeError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="size-3" /> {upgradeError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "profile",  label: "My Profile",    icon: User        },
  { key: "org",      label: "Organisation",  icon: Building2   },
  { key: "branding", label: "Branding",      icon: Palette     },
  { key: "billing",  label: "Billing",       icon: CreditCard  },
] as const;

type Tab = typeof TABS[number]["key"];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const tab          = (searchParams.get("tab") as Tab) ?? "profile";

  function setTab(t: Tab) {
    router.replace(`/settings?tab=${t}`);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and workspace</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted border border-border w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "profile"  && <ProfileTab />}
      {tab === "org"      && <OrgTab />}
      {tab === "branding" && <BrandingTab />}
      {tab === "billing"  && <BillingTab />}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
