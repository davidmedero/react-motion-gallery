import { describe, expect, test, vi } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import {
  buildSliderRestoreCss,
  buildSliderRestoreScript,
  createSliderRestoreStateForWindow,
  getSliderRestoreCookieName,
  getSliderRestoreVisibleSlots,
  isMeaningfulSliderRestoreState,
  parseSliderRestoreState,
  readSliderRestoreStateFromCache,
  readSliderRestoreStateFromWindow,
  validateSliderRestoreState,
} from "./SliderRestore";

const baseState = {
  version: 1 as const,
  index: 2,
  heightPx: 123.457,
  viewportWidth: 700,
  slideCount: 5,
  skeletonSlotCount: 5,
  timestamp: 1000,
  scrollY: 200,
  scrollMax: 400,
  wasAtBottom: false,
  storageKeyId: "auto-height",
  routeKey: "/demos?demo=slider-auto-height",
  scopeId: "scope",
};

function createRestoreWindow(args: {
  navigationType?: "reload" | "back_forward" | "navigate";
  raw?: string | null;
  innerWidth?: number;
}) {
  const innerWidth = args.innerWidth ?? baseState.viewportWidth;
  const cookieName = getSliderRestoreCookieName("auto-height", {
    pathname: "/demos",
    search: "?demo=slider-auto-height",
  } as Location);

  return {
    innerWidth,
    location: {
      pathname: "/demos",
      search: "?demo=slider-auto-height",
    },
    document: {
      cookie:
        args.raw == null
          ? ""
          : `${cookieName}=${encodeURIComponent(args.raw)}`,
      documentElement: {
        clientWidth: innerWidth,
      },
    },
    performance: {
      getEntriesByType: vi.fn(() => [
        {
          type: args.navigationType ?? "reload",
        },
      ]),
    },
  } as unknown as Window;
}

describe("Slider restore state", () => {
  test("validates fresh matching cookie state", () => {
    const state = validateSliderRestoreState(baseState, {
      ttlMs: 5000,
      now: 1200,
      viewportWidth: 701,
      slideCount: 5,
      skeletonSlotCount: 5,
      storageKeyId: "auto-height",
      routeKey: "/demos?demo=slider-auto-height",
      scopeId: "scope",
    });

    expect(state?.index).toBe(2);
    expect(state?.heightPx).toBe(123.457);
  });

  test("rejects expired, mismatched, and out-of-range state", () => {
    expect(
      validateSliderRestoreState(baseState, {
        ttlMs: 100,
        now: 1200,
        viewportWidth: 700,
        slideCount: 5,
        skeletonSlotCount: 5,
      })
    ).toBeNull();

    expect(
      validateSliderRestoreState(baseState, {
        ttlMs: 5000,
        now: 1200,
        viewportWidth: 740,
        slideCount: 5,
        skeletonSlotCount: 5,
      })
    ).toBeNull();

    expect(
      validateSliderRestoreState({ ...baseState, index: 5 }, {
        ttlMs: 5000,
        now: 1200,
        viewportWidth: 700,
        slideCount: 5,
        skeletonSlotCount: 5,
      })
    ).toBeNull();

    expect(
      validateSliderRestoreState(baseState, {
        ttlMs: 5000,
        now: 1200,
        viewportWidth: 700,
        slideCount: 4,
        skeletonSlotCount: 5,
      })
    ).toBeNull();

    expect(
      validateSliderRestoreState(baseState, {
        ttlMs: 5000,
        now: 1200,
        viewportWidth: 700,
        slideCount: 5,
        skeletonSlotCount: 4,
      })
    ).toBeNull();
  });

  test("parses only well-formed versioned restore payloads", () => {
    expect(parseSliderRestoreState(JSON.stringify(baseState))).toEqual(baseState);
    expect(parseSliderRestoreState("{nope")).toBeNull();
    expect(parseSliderRestoreState(JSON.stringify({ ...baseState, version: 2 }))).toBeNull();
  });

  test("reads reload and back-forward cookie state only for uncontrolled runtime", () => {
    const runtime = {
      enabled: true,
      storageKeyId: "auto-height",
      ttlMs: 5000,
      slideCount: 5,
      skeletonSlotCount: 5,
      scopeId: "scope",
    };
    const raw = JSON.stringify({ ...baseState, timestamp: Date.now() });
    const reloadWindow = createRestoreWindow({ navigationType: "reload", raw });
    const backForwardWindow = createRestoreWindow({
      navigationType: "back_forward",
      raw,
    });
    const navigateWindow = createRestoreWindow({ navigationType: "navigate", raw });

    expect(readSliderRestoreStateFromWindow(runtime, reloadWindow)?.index).toBe(2);
    expect(readSliderRestoreStateFromWindow(runtime, backForwardWindow)?.index).toBe(2);
    expect(readSliderRestoreStateFromWindow(runtime, navigateWindow)).toBeNull();
    expect(
      readSliderRestoreStateFromWindow(runtime, navigateWindow, {
        requireNavigationRestore: false,
      })?.index
    ).toBe(2);
    expect(
      readSliderRestoreStateFromWindow(
        {
          ...runtime,
          controlled: true,
        },
        reloadWindow
      )
    ).toBeNull();
  });

  test("treats first-slide restore state as a no-op unless bottom scroll is preserved", () => {
    const runtime = {
      enabled: true,
      storageKeyId: "auto-height",
      ttlMs: 5000,
      slideCount: 5,
      skeletonSlotCount: 5,
      scopeId: "scope",
    };
    const firstSlideState = {
      ...baseState,
      index: 0,
      timestamp: Date.now(),
      scrollY: 0,
      wasAtBottom: false,
    };
    const raw = JSON.stringify(firstSlideState);
    const reloadWindow = createRestoreWindow({ navigationType: "reload", raw });

    expect(isMeaningfulSliderRestoreState(firstSlideState)).toBe(false);
    expect(readSliderRestoreStateFromWindow(runtime, reloadWindow)).toBeNull();
    expect(
      readSliderRestoreStateFromCache(
        {
          version: 1,
          key: "slider-auto-height",
          scopeId: "scope",
          kind: "slider",
          routeKey: "/demos?demo=slider-auto-height",
          createdAt: Date.now(),
          widthBucketMin: 0,
          viewportWidth: 700,
          slider: {
            restore: firstSlideState,
          },
          text: {},
        },
        {
          ...runtime,
          routeKey: "/demos?demo=slider-auto-height",
        },
        reloadWindow
      )
    ).toBeNull();
    expect(
      isMeaningfulSliderRestoreState({
        ...firstSlideState,
        wasAtBottom: true,
      })
    ).toBe(true);
  });

  test("derives cookie names from the restore key and current route", () => {
    expect(
      getSliderRestoreCookieName("auto-height", {
        pathname: "/demos",
        search: "?demo=slider-auto-height",
      } as Location)
    ).toMatch(/^rmg_slider_restore_auto-height_[a-z0-9]+$/);
  });

  test("builds a pre-hydration script without sessionStorage or root mutations", () => {
    const script = buildSliderRestoreScript({
      scopeId: "scope",
      storageKeyId: "auto-height",
      ttlMs: 5000,
      slideCount: 5,
      skeletonSlotCount: 5,
      maxSlots: 5,
      loop: true,
      activeSlotOffset: 1,
      responsiveCount: 3,
      fallbackCount: 3,
      breakpointMap: BREAKPOINT_MAP,
    });

    expect(script).not.toContain("sessionStorage");
    expect(script).not.toContain("data-rmg-slider-restored-index");
    expect(script).not.toContain("Object.assign");
    expect(script).not.toContain('setAttribute("data-rmg-skel-dot-active"');
    expect(script).toContain("data-rmg-slider-restore-static");
    expect(script).toContain("removeAttribute(\"media\")");
    expect(script).toContain("[data-rmg-skel-slider-dot");
    expect(script).toContain("!important");
  });

  test("builds static gated CSS for cookie-backed restore state", () => {
    const css = buildSliderRestoreCss({
      scopeId: "scope",
      storageKeyId: "auto-height",
      ttlMs: 5000,
      slideCount: 5,
      skeletonSlotCount: 5,
      maxSlots: 5,
      loop: true,
      activeSlotOffset: 1,
      responsiveCount: 3,
      fallbackCount: 3,
      breakpointMap: BREAKPOINT_MAP,
      state: baseState,
    });

    expect(css).not.toContain("data-rmg-slider-restore-active");
    expect(css).toContain('[data-rmg-scope="scope"]');
    expect(css).toContain("--rmg-slider-initial-height:123.457px!important");
    expect(css).toContain('[data-rmg-skel-slot="3"]');
  });

  test("does not build restore CSS for first-slide no-op state", () => {
    const css = buildSliderRestoreCss({
      scopeId: "scope",
      storageKeyId: "auto-height",
      ttlMs: 5000,
      slideCount: 5,
      skeletonSlotCount: 5,
      maxSlots: 5,
      loop: true,
      activeSlotOffset: 1,
      responsiveCount: 3,
      fallbackCount: 3,
      breakpointMap: BREAKPOINT_MAP,
      state: {
        ...baseState,
        index: 0,
        scrollY: 0,
        wasAtBottom: false,
      },
    });

    expect(css).toBe("");
  });

  test("creates cookie restore state with route and scope metadata", () => {
    const state = createSliderRestoreStateForWindow(
      {
        enabled: true,
        storageKeyId: "auto-height",
        ttlMs: 5000,
        slideCount: 5,
        skeletonSlotCount: 5,
        scopeId: "scope",
      },
      {
        index: 2,
        heightPx: 461,
        slideCount: 5,
        skeletonSlotCount: 5,
      },
      createRestoreWindow({ navigationType: "reload" })
    );

    expect(state?.storageKeyId).toBe("auto-height");
    expect(state?.routeKey).toBe("/demos?demo=slider-auto-height");
    expect(state?.scopeId).toBe("scope");
    expect(state?.heightPx).toBe(461);
  });
});

describe("Slider restored skeleton windows", () => {
  test("wraps looped full-track slots around the active slide", () => {
    expect(
      getSliderRestoreVisibleSlots({
        activeIndex: 4,
        visibleCount: 3,
        slotCount: 5,
        loop: true,
        activeSlotOffset: 1,
      })
    ).toEqual([
      { slot: 5, order: 0 },
      { slot: 1, order: 1 },
      { slot: 2, order: 2 },
    ]);
  });

  test("clamps non-loop windows at the edges", () => {
    expect(
      getSliderRestoreVisibleSlots({
        activeIndex: 0,
        visibleCount: 3,
        slotCount: 5,
        loop: false,
        activeSlotOffset: 1,
      })
    ).toEqual([
      { slot: 1, order: 0 },
      { slot: 2, order: 1 },
      { slot: 3, order: 2 },
    ]);

    expect(
      getSliderRestoreVisibleSlots({
        activeIndex: 4,
        visibleCount: 3,
        slotCount: 5,
        loop: false,
        activeSlotOffset: 1,
      })
    ).toEqual([
      { slot: 3, order: 0 },
      { slot: 4, order: 1 },
      { slot: 5, order: 2 },
    ]);
  });
});
