// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://example.test/demos?demo=slider-auto-height"}

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
  getSkeletonCacheCookieName,
  serializeSkeletonCacheSnapshot,
  type SkeletonCacheSnapshot,
} from "./cache";
import {
  SkeletonCacheProvider,
  useSkeletonCacheContext,
} from "./cache-context";

function makeSnapshot(index: number): SkeletonCacheSnapshot {
  return {
    version: 1,
    key: "slider-auto-height",
    scopeId: "scope-a",
    kind: "slider",
    routeKey: "/demos?demo=slider-auto-height",
    createdAt: Date.now(),
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
        storageKeyId: "slider-auto-height",
        routeKey: "/demos?demo=slider-auto-height",
        scopeId: "scope-a",
      },
    },
    text: {},
  };
}

function SeenIndex(props: { seen: number[] }) {
  const context = useSkeletonCacheContext();
  const index =
    context?.snapshots?.["slider-auto-height"]?.slider?.restore?.index ?? -1;
  props.seen.push(index);
  return <div data-index={index} />;
}

describe("SkeletonCacheProvider client snapshot refresh", () => {
  let container: HTMLDivElement;
  let root: Root | null;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = null;
    document.cookie = `${getSkeletonCacheCookieName("slider-auto-height")}=; path=/; max-age=0`;
  });

  afterEach(async () => {
    if (root) {
      await React.act(async () => {
        root?.unmount();
      });
    }
    document.cookie = `${getSkeletonCacheCookieName("slider-auto-height")}=; path=/; max-age=0`;
    container.remove();
    delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  });

  test("prefers current client cookies over stale server snapshots on later mounts", async () => {
    const staleSnapshot = makeSnapshot(1);
    const freshSnapshot = makeSnapshot(3);
    const seen: number[] = [];

    document.cookie = `${getSkeletonCacheCookieName(
      "slider-auto-height"
    )}=${encodeURIComponent(serializeSkeletonCacheSnapshot(staleSnapshot))}; path=/`;

    root = createRoot(container);
    await React.act(async () => {
      root?.render(
        <SkeletonCacheProvider
          snapshots={{
            "slider-auto-height": staleSnapshot,
          }}
        >
          <SeenIndex seen={seen} />
        </SkeletonCacheProvider>
      );
    });
    expect(seen.at(-1)).toBe(1);

    await React.act(async () => {
      root?.unmount();
    });
    root = null;

    document.cookie = `${getSkeletonCacheCookieName(
      "slider-auto-height"
    )}=${encodeURIComponent(serializeSkeletonCacheSnapshot(freshSnapshot))}; path=/`;

    const nextSeen: number[] = [];
    root = createRoot(container);
    await React.act(async () => {
      root?.render(
        <SkeletonCacheProvider
          snapshots={{
            "slider-auto-height": staleSnapshot,
          }}
        >
          <SeenIndex seen={nextSeen} />
        </SkeletonCacheProvider>
      );
    });

    expect(nextSeen[0]).toBe(3);
  });
});
