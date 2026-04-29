"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Plan = "starter" | "professional" | "enterprise";

interface PlanContextValue {
  plan: Plan;
  setPlan: (p: Plan) => void;
}

const PlanContext = createContext<PlanContextValue>({
  plan: "professional",
  setPlan: () => {},
});

/**
 * PlanProvider — admin-only plan switcher for testing UI feature gates.
 * Regular users should read their plan from useOrg().plan (server-authoritative).
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>("professional");

  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
