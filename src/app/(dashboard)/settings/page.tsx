"use client";

import { Building2, Shield, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MFASection } from "@/components/dashboard/mfa-section";
import { useOrg } from "@/lib/org-context";

export default function SettingsPage() {
  const org = useOrg();
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
            <Building2 className="size-4" />
            Organisation
          </CardTitle>
          <CardDescription>Update your organisation details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Organisation name</Label>
            <Input defaultValue={org?.name ?? ""} key={org?.name} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input defaultValue={org?.slug ?? ""} key={org?.slug} />
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Save changes</Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="size-4" />
            Subscription
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
            <Shield className="size-4" />
            Security
          </CardTitle>
          <CardDescription>Protect your account with two-factor authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MFASection />
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Change password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
