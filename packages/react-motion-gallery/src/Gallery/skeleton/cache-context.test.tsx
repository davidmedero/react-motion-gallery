// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://example.test/demos?demo=slider-auto-height"}

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
  getSkeletonCacheCookieName,
  serializeSkeletonCacheSnapshot,
  SKELETON_CACHE_CHANGE_EVENT,
  type SkeletonCacheSnapshot,
} from "./cache";
import {
  resolveSkeletonCacheOptions,
  SkeletonCacheProvider,
  useSkeletonCacheRenderSnapshot,
  useSkeletonCacheContext,
} from "./cache-context";

function makeSnapshot(
  index: number,
  options: {
    createdAt?: number;
    key?: string;
  } = {}
): SkeletonCacheSnapshot {
  const key = options.key ?? "slider-auto-height";
  return {
    version: 1,
    key,
    scopeId: "scope-a",
    kind: "slider",
    routeKey: `/demos?demo=${key}`,
    createdAt: options.createdAt ?? Date.now(),
    widthBucketMin: 0,
    viewportWidth: window.innerWidth,
    slider: {
      restore: {
        version: 1,
        index,
        heightPx: 460 + index,
        viewportWidth: window.innerWidth,
        slideCount: 5,
        skeletonSlotCount: 5,
        timestamp: Date.now(),
        scrollY: 0,
        scrollMax: 0,
        wasAtBottom: false,
        storageKeyId: key,
        routeKey: `/demos?demo=${key}`,
        scopeId: "scope-a",
      },
    },
    text: {},
  };
}

function writeSnapshotCookie(snapshot: SkeletonCacheSnapshot) {
  document.cookie = `${getSkeletonCacheCookieName(snapshot.key)}=${encodeURIComponent(
    serializeSkeletonCacheSnapshot(snapshot)
  )}; path=/`;
}

function clearSkeletonCacheCookies() {
  for (const pair of document.cookie.split("; ")) {
    const name = pair.split("=")[0];
    if (name?.startsWith("rmg_skel_cache_")) {
      document.cookie = `${name}=; path=/; max-age=0`;
    }
  }
}

function ResolvedIndex(props: {
  cacheKey: string;
  routeKey?: string;
  seen: number[];
}) {
  const context = useSkeletonCacheContext();
  const resolved = resolveSkeletonCacheOptions(
    {
      key: props.cacheKey,
      ...(props.routeKey ? { routeKey: props.routeKey } : null),
    },
    context
  );
  const index = resolved?.snapshot?.slider?.restore?.index ?? -1;
  props.seen.push(index);
  return <div data-index={index} />;
}

function ContextIndex(props: { cacheKey: string; seen: number[] }) {
  const context = useSkeletonCacheContext();
  const index =
    context?.snapshots?.[props.cacheKey]?.slider?.restore?.index ?? -1;
  props.seen.push(index);
  return <div data-index={index} />;
}

function RenderSnapshotIndex(props: { cacheKey: string; seen: number[] }) {
  const context = useSkeletonCacheContext();
  const resolved = resolveSkeletonCacheOptions(
    { key: props.cacheKey },
    context
  );
  const snapshot = useSkeletonCacheRenderSnapshot(resolved);
  const index = snapshot?.slider?.restore?.index ?? -1;
  props.seen.push(index);
  return <div data-index={index} />;
}

describe("SkeletonCacheProvider cookie snapshots", () => {
  let container: HTMLDivElement;
  let root: Root | null;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    clearSkeletonCacheCookies();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = null;
  });

  afterEach(async () => {
    if (root) {
      await React.act(async () => {
        root?.unmount();
      });
    }
    clearSkeletonCacheCookies();
    container.remove();
    delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  });

  test("uses the current cookie for the requested key instead of stale server snapshots", async () => {
    const staleSnapshot = makeSnapshot(1);
    const freshSnapshot = makeSnapshot(3);
    const seen: number[] = [];

    writeSnapshotCookie(freshSnapshot);

    root = createRoot(container);
    await React.act(async () => {
      root?.render(
        <SkeletonCacheProvider snapshots={{ "slider-auto-height": staleSnapshot }}>
          <ResolvedIndex
            cacheKey="slider-auto-height"
            routeKey="/demos?demo=slider-auto-height"
            seen={seen}
          />
        </SkeletonCacheProvider>
      );
    });

    expect(seen.at(-1)).toBe(3);
  });

  test("does not fall back to stale server snapshots when the current cookie is missing", async () => {
    const staleSnapshot = makeSnapshot(1);
    const seen: number[] = [];

    root = createRoot(container);
    await React.act(async () => {
      root?.render(
        <SkeletonCacheProvider snapshots={{ "slider-auto-height": staleSnapshot }}>
          <ResolvedIndex
            cacheKey="slider-auto-height"
            routeKey="/demos?demo=slider-auto-height"
            seen={seen}
          />
        </SkeletonCacheProvider>
      );
    });

    expect(seen.at(-1)).toBe(-1);
  });

  test("refreshes provider snapshots after a cache-change event", async () => {
    const first = makeSnapshot(1);
    const next = makeSnapshot(4);
    const seen: number[] = [];

    writeSnapshotCookie(first);

    root = createRoot(container);
    await React.act(async () => {
      root?.render(
        <SkeletonCacheProvider snapshots={{}}>
          <ContextIndex cacheKey="slider-auto-height" seen={seen} />
        </SkeletonCacheProvider>
      );
    });
    expect(seen.at(-1)).toBe(1);

    writeSnapshotCookie(next);
    await React.act(async () => {
      window.dispatchEvent(new Event(SKELETON_CACHE_CHANGE_EVENT));
    });

    expect(seen.at(-1)).toBe(4);
  });

  test("keeps missing target cookies as normal uncached first visits after cache activity", async () => {
    const other = makeSnapshot(2, { key: "skeleton-responsive-text" });
    const seen: number[] = [];

    root = createRoot(container);
    await React.act(async () => {
      root?.render(
        <SkeletonCacheProvider snapshots={{}}>
          <ResolvedIndex cacheKey="slider-auto-height" seen={seen} />
        </SkeletonCacheProvider>
      );
    });
    expect(seen.at(-1)).toBe(-1);

    writeSnapshotCookie(other);
    await React.act(async () => {
      window.dispatchEvent(new Event(SKELETON_CACHE_CHANGE_EVENT));
    });

    expect(seen.at(-1)).toBe(-1);
  });

  test("keeps the current render uncached when a snapshot is written after first render", async () => {
    const freshSnapshot = makeSnapshot(3);
    const seen: number[] = [];

    root = createRoot(container);
    await React.act(async () => {
      root?.render(
        <SkeletonCacheProvider snapshots={{}}>
          <RenderSnapshotIndex cacheKey="slider-auto-height" seen={seen} />
        </SkeletonCacheProvider>
      );
    });
    expect(seen.at(-1)).toBe(-1);

    writeSnapshotCookie(freshSnapshot);
    await React.act(async () => {
      window.dispatchEvent(new Event(SKELETON_CACHE_CHANGE_EVENT));
    });

    expect(seen.at(-1)).toBe(-1);
  });
});
