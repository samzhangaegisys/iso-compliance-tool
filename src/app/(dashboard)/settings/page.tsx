"use client";

import { useState } from "react";
import { Building2, Shield, CreditCard, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MFASection } from "@/components/dashboard/mfa-section";
import { useOrg } from "@/lib/org-context";

function SaveFeedback({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  if (status === "saving") return <span className="text-xs text-muted-foreground">Saving…</span>;
  if (status === "saved") return (
    <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="size-3" /> Saved</span>
  );
  return <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="size-3" /> Failed to save</span>;
}

export default function SettingsPage() {
  const org = useOrg();

  const [orgName, setOrgName] = useState(org?.name ?? "");
  const [orgSlug, setOrgSlug] = useState(org?.slug ?? "");
  const [orgSaveStatus, setOrgSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Keep inputs in sync when org context loads
  if (org && orgName === "" && org.name) { setOrgName(org.name); setOrgSlug(org.slug); }

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew,     setPwNew]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwStatus,  setPwStatus]  = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError,   setPwError]   = useState("");

  async function handleOrgSave() {
    if (!orgName.trim() || !orgSlug.trim()) return;
    setOrgSaveStatus("saving");
    try {
      const res = await fetch("/api/org/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim(), slug: orgSlug.trim() }),
      });
      if (!res.ok) throw new Error();
      setOrgSaveStatus("saved");
      setTimeout(() => setOrgSaveStatus("idle"), 3000);
    } catch {
      setOrgSaveStatus("error");
      setTimeout(() => setOrgSaveStatus("idle"), 3000);
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your organisation settings</p>
      </div>

      {/* Organisation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="size-4" />Organisation
          </CardTitle>
          <CardDescription>Update your organisation details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Organisation name</Label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Your organisation name"
            />
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
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleOrgSave}
              disabled={orgSaveStatus === "saving"}
            >
              Save changes
            </Button>
            <SaveFeedback status={orgSaveStatus} />
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="size-4" />Subscription
          </CardTitle>
          <CardDescription>Manage your plan and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div>
              <p className="text-sm font-semibold capitalize">{org?.plan ?? "Starter"} Plan</p>
              <p className="text-xs text-muted-foreground">
                {org?.plan === "enterprise"
                  ? "Unlimited standards & users"
                  : org?.plan === "professional"
                    ? "All 5 standards · up to 20 users"
                    : "1 ISO standard · up to 5 users"}
              </p>
            </div>
            <Badge className="capitalize">{org?.plan ?? "Starter"}</Badge>
          </div>
          {org?.plan !== "enterprise" && (
            <Button variant="outline" size="sm" className="mt-3">
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4" />Security
          </CardTitle>
          <CardDescription>Protect your account with two-factor authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MFASection />
          <Separator />

          {/* Change password */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Change password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Current password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
              />
              <Input
                type="password"
                placeholder="New password (min 8 characters)"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
              />
            </div>
            {pwError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="size-3" /> {pwError}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasswordChange}
                disabled={pwStatus === "saving"}
              >
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
