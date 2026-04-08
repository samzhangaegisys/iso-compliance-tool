"use client";

import React from "react";

export function AnimatedBlob({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ animation: "blob 8s ease-in-out infinite", ...style }}
      aria-hidden="true"
    />
  );
}
