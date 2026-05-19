// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://example.test/demo"}

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  getSkeletonCacheCookieName,
  parseSkeletonCacheCookie,
} from "./cache";
import {
  updateSkeletonCacheSliderRestoreCookie,
  useSkeletonCacheWriter,
} from "./cache-writer";

function Harness({ restore = false }: { restore?: boolean }) {
  const skeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);

  useSkeletonCacheWriter({
    cache: {
      key: "writer-demo",
      debounceMs: 250,
      routeKey: "/demo",
    },
    kind: "masonry",
    scopeId: "scope",
    textIds: ["body"],
    skeletonRootRef,
    shellRef,
    getGeometrySnapshot: () => ({
      widthBucketMin: 900,
      viewportWidth: 920,
      layoutWidthPx: 640,
      masonry: {
        variantKey: "c2_g8",
        shellHeightPx: 200,
        itemHeightsPx: [200],
      },
    }),
    getSliderRestoreSnapshot: restore
      ? () => ({
          version: 1,
          index: 2,
          heightPx: 461,
          viewportWidth: 920,
          slideCount: 5,
          skeletonSlotCount: 5,
          timestamp: Date.now(),
          scrollY: 0,
          scrollMax: 100,
          wasAtBottom: false,
          storageKeyId: "writer-demo",
          routeKey: "/demo",
          scopeId: "scope",
        })
      : undefined,
  });

  return (
    <div ref={shellRef}>
      <div ref={skeletonRootRef}>
        <div data-rmg-skel-text-id="body">
          <div data-rmg-skel-text-line="true" />
        </div>
      </div>
      <div data-rmg-skeleton-content-layer="true">
        <p data-skeleton-text-id="body">Measured text</p>
      </div>
    </div>
  );
}

describe("skeleton cache writer", () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      return window.setTimeout(() => callback(performance.now()), 0);
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      window.clearTimeout(id);
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBoundingClientRectMock() {
        if (this.hasAttribute("data-skeleton-text-id")) {
          return {
            width: 180,
            height: 24,
          } as DOMRect;
        }
        if (this.hasAttribute("data-rmg-skel-text-id")) {
          return {
            width: 180,
            height: 21,
          } as DOMRect;
        }
        if (this.hasAttribute("data-rmg-skel-text-line")) {
          return {
            width: 180,
            height: 14,
          } as DOMRect;
        }
        return {
          width: 640,
          height: 200,
        } as DOMRect;
      }
    );

    document.cookie = `${getSkeletonCacheCookieName("writer-demo")}=; path=/; max-age=0`;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    React.act(() => {
      root?.unmount();
    });
    container?.remove();
    document.cookie = `${getSkeletonCacheCookieName("writer-demo")}=; path=/; max-age=0`;
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  });

  test("writes an initial geometry cookie and refreshes it after debounced resize", async () => {
    await React.act(async () => {
      root?.render(<Harness />);
    });

    await React.act(async () => {
      vi.runAllTimers();
    });

    const name = getSkeletonCacheCookieName("writer-demo");
    const firstRaw = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`))
      ?.slice(name.length + 1);
    const first = parseSkeletonCacheCookie(firstRaw, {
      key: "writer-demo",
      scopeId: "scope",
      kind: "masonry",
      routeKey: "/demo",
      now: 1100,
    });

    expect(first?.text.body.lines).toBe(1);
    expect(first?.text.body.lineWidthsPx).toEqual([180]);
    expect(first?.text.body.barWidths).toBeUndefined();
    expect(first?.text.body.containerWidthPx).toBe(180);
    expect(first?.text.body.lineHeight).toBeUndefined();
    expect(first?.masonry?.variantKey).toBe("c2_g8");

    vi.setSystemTime(2000);
    window.dispatchEvent(new Event("resize"));

    await React.act(async () => {
      vi.advanceTimersByTime(249);
    });
    const beforeDebounce = parseSkeletonCacheCookie(firstRaw, {
      key: "writer-demo",
      now: 2000,
    });
    expect(beforeDebounce?.createdAt).toBe(first?.createdAt);

    await React.act(async () => {
      vi.advanceTimersByTime(1);
      vi.runAllTimers();
    });

    const nextRaw = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`))
      ?.slice(name.length + 1);
    const next = parseSkeletonCacheCookie(nextRaw, {
      key: "writer-demo",
      now: 3000,
    });

    expect(next?.createdAt).toBeGreaterThan(first?.createdAt ?? 0);
  });

  test("writes and updates slider restore data while preserving text data", async () => {
    await React.act(async () => {
      root?.render(<Harness restore />);
    });

    await React.act(async () => {
      vi.runAllTimers();
    });

    const name = getSkeletonCacheCookieName("writer-demo");
    const raw = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`))
      ?.slice(name.length + 1);
    const first = parseSkeletonCacheCookie(raw, {
      key: "writer-demo",
      scopeId: "scope",
      kind: "masonry",
      routeKey: "/demo",
      now: 1100,
    });

    expect(first?.text.body.lineWidthsPx).toEqual([180]);
    expect(first?.slider?.restore?.heightPx).toBe(461);

    const updated = updateSkeletonCacheSliderRestoreCookie({
      cache: {
        key: "writer-demo",
        debounceMs: 250,
        routeKey: "/demo",
      },
      kind: "masonry",
      scopeId: "scope",
      restore: {
        version: 1,
        index: 3,
        heightPx: 552,
        viewportWidth: 920,
        slideCount: 5,
        skeletonSlotCount: 5,
        timestamp: Date.now(),
        scrollY: 10,
        scrollMax: 100,
        wasAtBottom: false,
        storageKeyId: "writer-demo",
        routeKey: "/demo",
        scopeId: "scope",
      },
    });
    const updatedRaw = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`))
      ?.slice(name.length + 1);
    const next = parseSkeletonCacheCookie(updatedRaw, {
      key: "writer-demo",
      scopeId: "scope",
      kind: "masonry",
      routeKey: "/demo",
      now: 1100,
    });

    expect(updated).toBe(true);
    expect(next?.text.body.lineWidthsPx).toEqual([180]);
    expect(next?.slider?.restore?.index).toBe(3);
    expect(next?.slider?.restore?.heightPx).toBe(552);

    const cleared = updateSkeletonCacheSliderRestoreCookie({
      cache: {
        key: "writer-demo",
        debounceMs: 250,
        routeKey: "/demo",
      },
      kind: "masonry",
      scopeId: "scope",
      restore: {
        version: 1,
        index: 0,
        heightPx: 461,
        viewportWidth: 920,
        slideCount: 5,
        skeletonSlotCount: 5,
        timestamp: Date.now(),
        scrollY: 0,
        scrollMax: 100,
        wasAtBottom: false,
        storageKeyId: "writer-demo",
        routeKey: "/demo",
        scopeId: "scope",
      },
    });
    const clearedRaw = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`))
      ?.slice(name.length + 1);
    const withoutRestore = parseSkeletonCacheCookie(clearedRaw, {
      key: "writer-demo",
      scopeId: "scope",
      kind: "masonry",
      routeKey: "/demo",
      now: 1100,
    });

    expect(cleared).toBe(true);
    expect(withoutRestore?.text.body.lineWidthsPx).toEqual([180]);
    expect(withoutRestore?.slider?.restore).toBeUndefined();
  });
});
