"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface OrgData {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  plan: string; // "starter" | "professional" | "enterprise"
  isNew: boolean; // org created within 30 days
  role: string;  // "OWNER" | "ADMIN" | "AUDITOR" | "MEMBER"
}

const OrgContext = createContext<OrgData | null>(null);

export function useOrg() {
  return useContext(OrgContext);
}

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<OrgData | null>(null);

  useEffect(() => {
    fetch("/api/user/org")
      .then((r) => r.json())
      .then((data) => { if (data.org) setOrg(data.org); })
      .catch(() => {});
  }, []);

  return <OrgContext.Provider value={org}>{children}</OrgContext.Provider>;
}
