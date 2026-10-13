"use client";
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useAdmin } from "./auth";
import { useRemote } from "./hooks";
import type { AttentionCounts, StaffAuthority } from "./workspace-contracts";
const Context = createContext<{
  authority: StaffAuthority | null;
  counts: AttentionCounts | null;
  countsError: string | null;
  refreshing: boolean;
  refresh: () => void;
} | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { api } = useAdmin();
  const loadAuthority = useCallback(() => api.staffAuthority(), [api]);
  const loadCounts = useCallback(() => api.attentionCounts(), [api]);
  const authority = useRemote(loadAuthority, "staff-authority");
  const counts = useRemote(loadCounts, "attention-counts", true);
  return (
    <Context.Provider
      value={{
        authority: authority.data,
        counts: counts.data,
        countsError: counts.error || authority.error,
        refreshing: counts.loading,
        refresh: () => {
          counts.refresh();
          authority.refresh();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const state = useContext(Context);
  if (!state) throw new Error("Staff workspace provider is required");
  return state;
}
export function canAct(
  authority: StaffAuthority | null,
  capability: string,
  mfa = false,
) {
  return Boolean(
    authority?.capabilities.includes(capability) &&
    (!mfa || authority.assuranceLevel === "aal2"),
  );
}
