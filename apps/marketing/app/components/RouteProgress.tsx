"use client";

import { ProgressProvider } from "@bprogress/next/app";
import type { ReactNode } from "react";

export function RouteProgress({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider
      height="3px"
      color="var(--rmg-logo-magenta)"
      delay={90}
      startPosition={0.12}
      options={{ showSpinner: false }}
    >
      {children}
    </ProgressProvider>
  );
}
