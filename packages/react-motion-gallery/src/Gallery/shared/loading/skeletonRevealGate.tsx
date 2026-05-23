import * as React from "react";

type SkeletonRevealGateValue = boolean | null;

const SkeletonRevealGateContext =
  React.createContext<SkeletonRevealGateValue>(null);

export function SkeletonRevealGateProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: boolean;
}) {
  return (
    <SkeletonRevealGateContext.Provider value={value}>
      {children}
    </SkeletonRevealGateContext.Provider>
  );
}

export function useSkeletonRevealGate(): SkeletonRevealGateValue {
  return React.useContext(SkeletonRevealGateContext);
}
