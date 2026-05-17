"use client";

import * as React from "react";

import type {
  SkeletonCacheOptions,
  SkeletonCacheProviderProps,
  SkeletonCacheSnapshot,
} from "./cache";

type SkeletonCacheContextValue = {
  options?: Omit<SkeletonCacheOptions, "snapshot">;
  snapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
};

const SkeletonCacheContext =
  React.createContext<SkeletonCacheContextValue | null>(null);

export function SkeletonCacheProvider({
  children,
  options,
  snapshot,
  snapshots,
}: SkeletonCacheProviderProps) {
  const value = React.useMemo<SkeletonCacheContextValue>(() => {
    const nextSnapshots: Record<string, SkeletonCacheSnapshot | null | undefined> = {
      ...(snapshots ?? {}),
    };

    if (snapshot?.key) {
      nextSnapshots[snapshot.key] = snapshot;
    }

    return {
      options,
      snapshots: nextSnapshots,
    };
  }, [options, snapshot, snapshots]);

  return (
    <SkeletonCacheContext.Provider value={value}>
      {children}
    </SkeletonCacheContext.Provider>
  );
}

export function useSkeletonCacheContext() {
  return React.useContext(SkeletonCacheContext);
}

export function resolveSkeletonCacheOptions(
  cache: SkeletonCacheOptions | undefined,
  context: SkeletonCacheContextValue | null
): SkeletonCacheOptions | null {
  const key = cache?.key ?? context?.options?.key;
  if (!key) return null;

  return {
    ...(context?.options ?? {}),
    ...(cache ?? { key }),
    key,
    snapshot:
      cache?.snapshot ??
      context?.snapshots?.[key] ??
      (context?.options as SkeletonCacheOptions | undefined)?.snapshot ??
      null,
    cookie: {
      ...(context?.options?.cookie ?? {}),
      ...(cache?.cookie ?? {}),
    },
  };
}
