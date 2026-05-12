import { describe, expect, test, vi } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import {
  buildSliderRestoreScript,
  getSliderRestoreStorageKey,
  getSliderRestoreVisibleSlots,
  parseSliderRestoreState,
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
};

function createRestoreWindow(args: {
  navigationType?: "reload" | "back_forward" | "navigate";
  raw?: string | null;
  innerWidth?: number;
}) {
  const innerWidth = args.innerWidth ?? baseState.viewportWidth;
  const storage = {
    getItem: vi.fn(() => args.raw ?? null),
    setItem: vi.fn(),
  };

  return {
    innerWidth,
    location: {
      pathname: "/demos",
      search: "?demo=slider-auto-height",
    },
    document: {
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
    sessionStorage: storage,
  } as unknown as Window;
}

describe("Slider restore state", () => {
  test("validates fresh matching session state", () => {
    const state = validateSliderRestoreState(baseState, {
      ttlMs: 5000,
      now: 1200,
      viewportWidth: 701,
      slideCount: 5,
      skeletonSlotCount: 5,
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

  test("reads reload and back-forward state only for uncontrolled runtime", () => {
    const runtime = {
      enabled: true,
      storageKeyId: "auto-height",
      ttlMs: 5000,
      slideCount: 5,
      skeletonSlotCount: 5,
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
      readSliderRestoreStateFromWindow(
        {
          ...runtime,
          controlled: true,
        },
        reloadWindow
      )
    ).toBeNull();
  });

  test("derives storage keys from the restore key and current route", () => {
    expect(
      getSliderRestoreStorageKey("auto-height", {
        pathname: "/demos",
        search: "?demo=slider-auto-height",
      } as Location)
    ).toBe("rmg:slider-restore:auto-height:/demos?demo=slider-auto-height");
  });

  test("builds a pre-hydration script without mutating hydratable skeleton nodes", () => {
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

    expect(script).not.toContain("data-rmg-slider-restored-index");
    expect(script).not.toContain("Object.assign");
    expect(script).not.toContain('setAttribute("data-rmg-skel-dot-active"');
    expect(script).toContain("[data-rmg-skel-slider-dot");
    expect(script).toContain("!important");
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
