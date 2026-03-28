"use client";

import { useState, useCallback, type ReactNode } from "react";
import { AppContext } from "@/lib/hooks/use-active-property";
import type { Property, Organization, Membership } from "@/lib/types";

export function AppProvider({
  organization,
  membership,
  properties,
  initialPropertyId,
  children,
}: {
  organization: Organization;
  membership: Membership;
  properties: Property[];
  initialPropertyId?: string;
  children: ReactNode;
}) {
  const [activePropertyId, setActivePropertyId] = useState(
    initialPropertyId ?? properties[0]?.id ?? ""
  );

  const activeProperty =
    properties.find((p) => p.id === activePropertyId) ?? properties[0] ?? null;

  const handleSetActivePropertyId = useCallback((id: string) => {
    setActivePropertyId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("vael-active-property", id);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        organization,
        membership,
        properties,
        activeProperty,
        setActivePropertyId: handleSetActivePropertyId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
