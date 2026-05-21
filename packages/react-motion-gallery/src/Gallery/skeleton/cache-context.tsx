"use client";

import * as React from "react";

import type {
  SkeletonCacheOptions,
  SkeletonCacheProviderProps,
  SkeletonCacheSnapshot,
} from "./cache";
import {
  SKELETON_CACHE_CHANGE_EVENT,
  getSkeletonCacheCookieName,
  parseSkeletonCacheCookie,
} from "./cache";

type SkeletonCacheContextValue = {
  options?: Omit<SkeletonCacheOptions, "snapshot">;
  snapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
  hasClientCacheActivity?: boolean;
};

const SkeletonCacheContext =
  React.createContext<SkeletonCacheContextValue | null>(null);

const SKELETON_CACHE_COOKIE_PREFIX = "rmg_skel_cache_";

let hasMountedSkeletonCacheProvider = false;

function snapshotsFingerprint(
  snapshots: Record<string, SkeletonCacheSnapshot | null | undefined>
) {
  return Object.keys(snapshots)
    .sort()
    .map((key) => {
      const snapshot = snapshots[key];
      if (!snapshot) return `${key}:`;
      return [
        key,
        snapshot.createdAt,
        snapshot.scopeId,
        snapshot.kind,
        snapshot.routeKey ?? "",
        snapshot.viewportWidth,
        snapshot.widthBucketMin,
        snapshot.slider?.restore?.index ?? "",
        snapshot.slider?.restore?.heightPx ?? "",
        snapshot.slider?.restore?.wasAtBottom ? "bottom" : "",
        snapshot.masonry?.variantKey ?? "",
      ].join(":");
    })
    .join("|");
}

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

function readCookieValue(name: string) {
  if (typeof document === "undefined" || !document.cookie) return undefined;

  const prefix = `${name}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return null;
}

function readClientSkeletonCacheSnapshot(cache: SkeletonCacheOptions) {
  const raw = readCookieValue(getSkeletonCacheCookieName(cache.key));
  if (raw === undefined) return undefined;
  if (raw === null) return null;

  return parseSkeletonCacheCookie(raw, {
    key: cache.key,
    routeKey: cache.routeKey,
    ttlMs: cache.ttlMs,
  });
}

function readClientSkeletonCacheSnapshots(knownKeys: readonly string[] = []) {
  if (typeof document === "undefined") {
    return { snapshots: {}, hasCacheCookie: false };
  }

  const nextSnapshots: Record<string, SkeletonCacheSnapshot | null | undefined> = {};
  const parts = document.cookie ? document.cookie.split(/; */) : [];
  let hasCacheCookie = false;
  for (const part of parts) {
    if (!part.startsWith(SKELETON_CACHE_COOKIE_PREFIX)) continue;
    hasCacheCookie = true;
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

  return { snapshots: nextSnapshots, hasCacheCookie };
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
  const [clientState, setClientState] = React.useState(() => {
    if (!hasMountedSkeletonCacheProvider) {
      return {
        snapshots: {} as Record<string, SkeletonCacheSnapshot | null | undefined>,
        fingerprint: "",
        hasCacheActivity: false,
      };
    }

    const initial = readClientSkeletonCacheSnapshots(Object.keys(propSnapshots));
    return {
      snapshots: initial.snapshots,
      fingerprint: snapshotsFingerprint(initial.snapshots),
      hasCacheActivity: initial.hasCacheCookie,
    };
  });

  React.useEffect(() => {
    hasMountedSkeletonCacheProvider = true;

    const refresh = () => {
      const next = readClientSkeletonCacheSnapshots(Object.keys(propSnapshots));
      const nextFingerprint = snapshotsFingerprint(next.snapshots);
      setClientState((prev) => {
        const hasCacheActivity = prev.hasCacheActivity || next.hasCacheCookie;
        if (
          prev.fingerprint === nextFingerprint &&
          prev.hasCacheActivity === hasCacheActivity
        ) {
          return prev;
        }

        return {
          snapshots: next.snapshots,
          fingerprint: nextFingerprint,
          hasCacheActivity,
        };
      });
    };

    refresh();
    window.addEventListener("pageshow", refresh);
    window.addEventListener("popstate", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener(SKELETON_CACHE_CHANGE_EVENT, refresh);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(SKELETON_CACHE_CHANGE_EVENT, refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [propSnapshots]);

  const value = React.useMemo<SkeletonCacheContextValue>(() => {
    const nextSnapshots = {
      ...propSnapshots,
      ...clientState.snapshots,
    };

    for (const [key, clientSnapshot] of Object.entries(clientState.snapshots)) {
      if (clientSnapshot === undefined || clientSnapshot === null) {
        delete nextSnapshots[key];
      }
    }

    return {
      options,
      snapshots: nextSnapshots,
      hasClientCacheActivity: clientState.hasCacheActivity,
    };
  }, [clientState, options, propSnapshots]);

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
  const directSnapshot = cache?.snapshot;
  const resolvedCache = {
    ...(context?.options ?? {}),
    ...(cache ?? { key }),
    key,
    cookie: {
      ...(context?.options?.cookie ?? {}),
      ...(cache?.cookie ?? {}),
    },
  };
  const cookieSnapshot =
    typeof document === "undefined"
      ? undefined
      : readClientSkeletonCacheSnapshot(resolvedCache);
  const optionSnapshot =
    (context?.options as SkeletonCacheOptions | undefined)?.snapshot ?? null;
  const resolvedSnapshot =
    directSnapshot ??
    (cookieSnapshot !== undefined
      ? cookieSnapshot
      : context?.snapshots?.[key] ?? optionSnapshot);

  const next = {
    ...resolvedCache,
    snapshot: resolvedSnapshot,
  };

  return next;
}

export function useSkeletonCacheRenderSnapshot(
  cache: SkeletonCacheOptions | null | undefined
) {
  const identity = `${cache?.key ?? ""}\u0001${cache?.routeKey ?? ""}`;
  const ref = React.useRef<{
    identity: string;
    snapshot: SkeletonCacheSnapshot | null;
  } | null>(null);

  if (!ref.current || ref.current.identity !== identity) {
    ref.current = {
      identity,
      snapshot: cache?.snapshot ?? null,
    };
  }

  return ref.current.snapshot;
}
