"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function LogoLink({
  dark = false,
  size = "md",
}: {
  dark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const iconSize = size === "sm" ? "size-5" : size === "lg" ? "size-9" : "size-7";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  const textColor = dark ? "text-slate-900" : "text-white";

  return (
    <Link href="/" className="flex items-center gap-2.5 group w-fit">
      <div className="relative">
        <ShieldCheck
          className={`${iconSize} text-blue-500 transition-all duration-300 group-hover:text-blue-400 group-hover:scale-110 group-hover:rotate-6`}
        />
        {/* Glow ring on hover */}
        <span className="absolute inset-0 rounded-full bg-blue-500/20 scale-0 group-hover:scale-150 transition-transform duration-300 pointer-events-none" />
      </div>
      <span
        className={`${textSize} font-bold ${textColor} tracking-tight transition-colors duration-300 group-hover:text-blue-400`}
        style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
      >
        ISOComply
      </span>
    </Link>
  );
}
