"use client";

import { useState, useEffect } from "react";
import { Shield, Smartphone, CheckCircle2, AlertCircle, AlertTriangle, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type SetupState = "idle" | "loading" | "setup" | "verifying" | "enabled" | "disabling";

export function MFASection() {
  const [state, setState] = useState<SetupState>("loading");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/mfa/status")
      .then((r) => r.json())
      .then((d) => setState(d.enabled ? "enabled" : "idle"))
      .catch(() => setState("idle"));
  }, []);

  async function startSetup() {
    setState("loading");
    setError("");
    const res = await fetch("/api/mfa/setup");
    const data = await res.json();
    if (data.error) { setError(data.error); setState("idle"); return; }
    setQrDataUrl(data.qrDataUrl);
    setSecret(data.secret);
    setState("setup");
  }

  async function verifyAndEnable(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setError("Enter the full 6-digit code."); return; }
    setState("verifying");
    setError("");
    const res = await fetch("/api/mfa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setState("setup"); return; }
    setState("enabled");
    setCode("");
  }

  async function disableMfa(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setError("Enter the 6-digit code to confirm."); return; }
    setState("verifying");
    setError("");
    const res = await fetch("/api/mfa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setState("disabling"); return; }
    setState("idle");
    setCode("");
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // --- Render ---

  if (state === "loading") {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <span className="size-3.5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  if (state === "enabled") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Shield className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                Authenticator app
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Active</Badge>
              </p>
              <p className="text-xs text-muted-foreground">TOTP-based MFA is protecting your account</p>
            </div>
          </div>
        </div>

        {state === "enabled" && (
          <div>
            <Separator className="mb-4" />
            {state !== ("disabling" as SetupState) ? (
              <div>
                <p className="text-xs text-muted-foreground mb-3">
                  To disable MFA, enter your current authenticator code to confirm.
                </p>
                <button
                  onClick={() => { setState("disabling" as SetupState); setCode(""); setError(""); }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Remove authenticator app
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  if (state === "disabling") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center">
            <X className="size-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">Disable two-factor authentication</p>
            <p className="text-xs text-muted-foreground">This will remove MFA from your account</p>
          </div>
        </div>
        <form onSubmit={disableMfa} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              <AlertCircle className="size-3.5 shrink-0" /> {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Confirm with your authenticator code</Label>
            <Input
              type="text" inputMode="numeric" maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000 000" autoFocus
              className="h-10 text-center font-mono tracking-widest text-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={code.length !== 6 || state === ("verifying" as SetupState)}>
              {state === ("verifying" as SetupState) ? "Disabling…" : "Disable MFA"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setState("enabled"); setError(""); setCode(""); }}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (state === "setup") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Set up your authenticator app</p>
          <p className="text-xs text-muted-foreground">
            Use any TOTP app: Google Authenticator, Authy, Microsoft Authenticator, 1Password, Bitwarden, etc.
          </p>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
          <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Save this backup key somewhere safe</span> (e.g. a password manager).
            You&apos;ll need it if you lose access to your authenticator app — otherwise you&apos;ll be locked out
            of your account.
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-5 text-sm">
          <li className="flex gap-3">
            <span className="size-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div className="flex-1">
              <p className="font-medium text-foreground mb-3">Scan this QR code with your authenticator app</p>
              {qrDataUrl && (
                <div className="inline-block rounded-xl border border-border p-3 bg-white shadow-sm">
                  <img src={qrDataUrl} alt="MFA QR Code" className="size-40" />
                </div>
              )}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Or enter this key manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted rounded-lg px-3 py-1.5 text-xs font-mono tracking-widest text-foreground border border-border">
                    {secret.match(/.{1,4}/g)?.join(" ")}
                  </code>
                  <button onClick={copySecret} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 shrink-0 transition-colors">
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="size-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div className="flex-1">
              <p className="font-medium text-foreground mb-3">Enter the 6-digit code to verify</p>
              <form onSubmit={verifyAndEnable} className="space-y-3">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                    <AlertCircle className="size-3.5 shrink-0" /> {error}
                  </div>
                )}
                <Input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000 000"
                  className="h-11 max-w-[160px] text-center font-mono tracking-widest text-xl"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={code.length !== 6 || state === ("verifying" as SetupState)}>
                    {state === ("verifying" as SetupState) ? (
                      <span className="flex items-center gap-1.5">
                        <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5" />Activate MFA</span>
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setState("idle"); setCode(""); setError(""); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </li>
        </ol>
      </div>
    );
  }

  // Idle state — not yet set up
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Smartphone className="size-5 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Authenticator app</p>
          <p className="text-xs text-muted-foreground">Not configured — add an extra layer of security</p>
        </div>
      </div>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0" onClick={startSetup}>
        Set up MFA
      </Button>
    </div>
  );
}
