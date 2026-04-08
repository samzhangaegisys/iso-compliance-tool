"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Plan = "starter" | "professional" | "enterprise";

interface PlanContextValue {
  plan: Plan;
  setPlan: (p: Plan) => void;
}

const PlanContext = createContext<PlanContextValue>({
  plan: "professional",
  setPlan: () => {},
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<Plan>("professional");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mock_plan") as Plan | null;
      if (saved && ["starter", "professional", "enterprise"].includes(saved)) {
        setPlanState(saved);
      }
    } catch {}
  }, []);

  function setPlan(p: Plan) {
    setPlanState(p);
    try { localStorage.setItem("mock_plan", p); } catch {}
  }

  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
