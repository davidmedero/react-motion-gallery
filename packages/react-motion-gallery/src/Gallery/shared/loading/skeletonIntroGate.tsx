import * as React from "react";

type SkeletonIntroGateValue = boolean | null;

const SkeletonIntroGateContext =
  React.createContext<SkeletonIntroGateValue>(null);

export function SkeletonIntroGateProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: boolean;
}) {
  return (
    <SkeletonIntroGateContext.Provider value={value}>
      {children}
    </SkeletonIntroGateContext.Provider>
  );
}

export function useSkeletonIntroGate(): SkeletonIntroGateValue {
  return React.useContext(SkeletonIntroGateContext);
}
