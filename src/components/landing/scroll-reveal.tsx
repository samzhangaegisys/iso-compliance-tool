"use client";
import React, { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

// Wraps children and fades/slides them in when they scroll into view
export function AnimateIn({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const { ref, inView } = useInView();

  const initial: Record<string, string> = {
    up: "translateY(48px)",
    left: "translateX(-48px)",
    right: "translateX(48px)",
    none: "none",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : initial[direction],
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Counts up from 0 to `to` when in view
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1800,
  className,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * to));
      if (step >= steps) clearInterval(id);
    }, stepTime);
    return () => clearInterval(id);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}

// Staggered fade-up animation for a list of children
export function StaggerIn({
  children,
  className,
  baseDelay = 0,
  stagger = 100,
}: {
  children: React.ReactNode[];
  className?: string;
  baseDelay?: number;
  stagger?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, i) => (
        <div
          style={{
            opacity: inView ? 1 : 0,
            animation: inView ? `fade-up 0.6s ease forwards` : "none",
            animationDelay: `${baseDelay + i * stagger}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
