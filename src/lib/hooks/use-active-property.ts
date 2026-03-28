"use client";

import { createContext, useContext } from "react";
import type { Property, Organization, Membership } from "@/lib/types";

type AppContextType = {
  organization: Organization | null;
  membership: Membership | null;
  properties: Property[];
  activeProperty: Property | null;
  setActivePropertyId: (id: string) => void;
};

export const AppContext = createContext<AppContextType>({
  organization: null,
  membership: null,
  properties: [],
  activeProperty: null,
  setActivePropertyId: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

export function useActiveProperty() {
  const { activeProperty } = useApp();
  if (!activeProperty) throw new Error("No active property selected");
  return activeProperty;
}

export function useOrganization() {
  const { organization } = useApp();
  if (!organization) throw new Error("No organization found");
  return organization;
}
