"use client";

import * as React from "react";

import type {
  SkeletonCacheOptions,
  SkeletonCacheProviderProps,
  SkeletonCacheSnapshot,
} from "./cache";
import { parseSkeletonCacheCookie } from "./cache";

type SkeletonCacheContextValue = {
  options?: Omit<SkeletonCacheOptions, "snapshot">;
  snapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
};

const SkeletonCacheContext =
  React.createContext<SkeletonCacheContextValue | null>(null);

const SKELETON_CACHE_COOKIE_PREFIX = "rmg_skel_cache_";

let hasMountedSkeletonCacheProvider = false;

function mergeSnapshotProps(
  snapshot: SkeletonCacheSnapshot | null | undefined,
  snapshots: Record<string, SkeletonCacheSnapshot | null | undefined> | undefined
) {
  const nextSnapshots: Record<string, SkeletonCacheSnapshot | null | undefined> = {
    ...(snapshots ?? {}),
  };

  if (snapshot?.key) {
    nextSnapshots[snapshot.key] = snapshot;
  }

  return nextSnapshots;
}

function readClientSkeletonCacheSnapshots(knownKeys: readonly string[] = []) {
  if (typeof document === "undefined") {
    return {};
  }

  const nextSnapshots: Record<string, SkeletonCacheSnapshot | null | undefined> = {};
  const parts = document.cookie ? document.cookie.split(/; */) : [];
  for (const part of parts) {
    if (!part.startsWith(`${SKELETON_CACHE_COOKIE_PREFIX}`)) continue;
    const equalsIndex = part.indexOf("=");
    if (equalsIndex < 0) continue;

    const snapshot = parseSkeletonCacheCookie(part.slice(equalsIndex + 1));
    if (snapshot) {
      nextSnapshots[snapshot.key] = snapshot;
    }
  }

  for (const key of knownKeys) {
    if (!(key in nextSnapshots)) {
      nextSnapshots[key] = null;
    }
  }

  return nextSnapshots;
}

export function SkeletonCacheProvider({
  children,
  options,
  snapshot,
  snapshots,
}: SkeletonCacheProviderProps) {
  const propSnapshots = React.useMemo(
    () => mergeSnapshotProps(snapshot, snapshots),
    [snapshot, snapshots]
  );
  const [clientSnapshots, setClientSnapshots] = React.useState<
    Record<string, SkeletonCacheSnapshot | null | undefined>
  >(() =>
    hasMountedSkeletonCacheProvider
      ? readClientSkeletonCacheSnapshots(Object.keys(propSnapshots))
      : {}
  );

  React.useEffect(() => {
    hasMountedSkeletonCacheProvider = true;

    const refresh = () => {
      setClientSnapshots(readClientSkeletonCacheSnapshots(Object.keys(propSnapshots)));
    };

    refresh();
    window.addEventListener("pageshow", refresh);
    window.addEventListener("popstate", refresh);
    window.addEventListener("focus", refresh);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [propSnapshots]);

  const value = React.useMemo<SkeletonCacheContextValue>(() => {
    const nextSnapshots = {
      ...propSnapshots,
      ...clientSnapshots,
    };

    for (const [key, clientSnapshot] of Object.entries(clientSnapshots)) {
      if (clientSnapshot === undefined || clientSnapshot === null) {
        delete nextSnapshots[key];
      }
    }

    return {
      options,
      snapshots: nextSnapshots,
    };
  }, [clientSnapshots, options, propSnapshots]);

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
