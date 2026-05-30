"use client";

import { useEffect, useRef, useCallback } from "react";

// Production site key from env. No fallback — using Cloudflare's "always-pass"
// test key (1x00000000000000000000AA) silently accepts every request and
// defeats the whole point of the captcha. If this is empty in any environment,
// the widget renders an inline configuration error instead of pretending to work.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: object) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

type Props = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

export function TurnstileWidget({ onVerify, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!SITE_KEY) return;
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return; // already rendered
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: "light",
      callback: onVerify,
      "expired-callback": () => {
        widgetIdRef.current = null;
        onExpire?.();
      },
    });
  }, [onVerify, onExpire]);

  useEffect(() => {
    if (!SITE_KEY) return; // misconfigured — render inline error, don't load script
    if (window.turnstile) {
      renderWidget();
      return;
    }
    window.onTurnstileLoad = renderWidget;
    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      document.head.appendChild(script);
    }
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  if (!SITE_KEY) {
    return (
      <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Captcha is misconfigured. Set <code className="font-mono">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> in the deploy environment.
      </div>
    );
  }

  return <div ref={containerRef} className="mt-2" />;
}
