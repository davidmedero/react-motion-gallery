// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import createSliderIndexChannel from "../slider/sliderSub";
import ThumbnailSlider, {
  resolveThumbnailCrossfadeMinDistance,
  resolveThumbnailIndexDistance,
  resolveThumbnailFadeOnSyncOptions,
  resolveThumbnailVisibleIndicesForScroll,
  shouldFadeThumbnailSync,
  shouldUseThumbnailCrossfade,
} from "./ThumbnailSlider";

type ResizeObserverEntryLike = {
  target: Element;
  contentRect: DOMRect;
};

type SetupResult = {
  cleanup: () => Promise<void>;
  root: Root;
};

const SYNC_TEST_CONTAINER_WIDTH = 372;
const SYNC_TEST_THUMB_SIZE = 68;
const SYNC_TEST_GAP = 8;

let resizeObservers: MockResizeObserver[] = [];
let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn> | null = null;
let originalClientWidth: PropertyDescriptor | undefined;
let originalClientHeight: PropertyDescriptor | undefined;
let originalOffsetWidth: PropertyDescriptor | undefined;
let originalOffsetHeight: PropertyDescriptor | undefined;

class MockResizeObserver {
  callback: (entries: ResizeObserverEntryLike[], observer: MockResizeObserver) => void;
  targets = new Set<Element>();

  constructor(
    callback: (entries: ResizeObserverEntryLike[], observer: MockResizeObserver) => void
  ) {
    this.callback = callback;
    resizeObservers.push(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }
}

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    const rect = target.getBoundingClientRect();
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: null,
          time: 0,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  }

  unobserve() {}

  disconnect() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function parsePixels(value: string | null | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith("px")) {
    const parsed = Number.parseFloat(trimmed.slice(0, -2));
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readTranslate(transform: string, axis: "x" | "y") {
  if (!transform || transform === "none") return 0;

  const translate3d = transform.match(
    /translate3d\(\s*(-?\d*\.?\d+)px\s*,\s*(-?\d*\.?\d+)px/i
  );
  if (translate3d) {
    const parsed = Number.parseFloat(translate3d[axis === "x" ? 1 : 2] ?? "0");
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const translate = transform.match(
    axis === "x"
      ? /translateX\(\s*(-?\d*\.?\d+)px/i
      : /translateY\(\s*(-?\d*\.?\d+)px/i
  );
  if (translate) {
    const parsed = Number.parseFloat(translate[1] ?? "0");
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function readCumulativeTranslate(el: HTMLElement, axis: "x" | "y") {
  let current: HTMLElement | null = el;
  let value = 0;

  while (current && current !== document.body) {
    value += readTranslate(current.style.transform, axis);
    current = current.parentElement;
  }

  return value;
}

function readElementWidth(el: HTMLElement): number {
  const explicit = parsePixels(el.style.width);
  if (explicit != null) return explicit;

  if (el.style.width === "100%") {
    const parent = el.parentElement;
    return parent instanceof HTMLElement
      ? readElementWidth(parent)
      : SYNC_TEST_CONTAINER_WIDTH;
  }

  if (el.hasAttribute("data-rmg-thumb-core-scope")) return SYNC_TEST_CONTAINER_WIDTH;
  if (el.hasAttribute("data-rmg-thumb-index")) return SYNC_TEST_THUMB_SIZE;

  return 0;
}

function readElementHeight(el: HTMLElement): number {
  const explicit = parsePixels(el.style.height);
  if (explicit != null) return explicit;

  if (el.style.height === "100%") {
    const parent = el.parentElement;
    return parent instanceof HTMLElement ? readElementHeight(parent) : SYNC_TEST_THUMB_SIZE;
  }

  if (el.hasAttribute("data-rmg-thumb-core-scope")) return SYNC_TEST_THUMB_SIZE;
  if (el.hasAttribute("data-rmg-thumb-index")) return SYNC_TEST_THUMB_SIZE;

  return 0;
}

function createRect(el: HTMLElement): DOMRect {
  const left = (parsePixels(el.style.left) ?? 0) + readCumulativeTranslate(el, "x");
  const top = (parsePixels(el.style.top) ?? 0) + readCumulativeTranslate(el, "y");
  const width = readElementWidth(el);
  const height = readElementHeight(el);

  return {
    x: left,
    y: top,
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect;
}

function triggerResizeObservers() {
  for (const observer of resizeObservers) {
    if (observer.targets.size === 0) continue;

    observer.callback(
      Array.from(observer.targets).map((target) => ({
        target,
        contentRect: createRect(target as HTMLElement),
      })),
      observer
    );
  }
}

async function settle(cycles = 8) {
  for (let i = 0; i < cycles; i++) {
    await React.act(async () => {
      triggerResizeObservers();
      vi.advanceTimersByTime(32);
      await Promise.resolve();
    });
  }
}

function createThumbItems(count: number) {
  return Array.from({ length: count }, (_, index) =>
    React.createElement(
      "div",
      {
        key: `thumb-${index}`,
        style: {
          width: "100%",
          height: "100%",
        },
      },
      `Thumb ${index}`
    )
  );
}

async function setup(node: React.ReactNode): Promise<SetupResult> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  await React.act(async () => {
    root.render(node);
  });
  await settle();

  return {
    root,
    cleanup: async () => {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    },
  };
}

function getThumbnailTrack() {
  const firstThumb = document.querySelector<HTMLElement>("[data-rmg-thumb-index]");
  expect(firstThumb).not.toBeNull();

  const track = firstThumb?.parentElement;
  expect(track).toBeInstanceOf(HTMLElement);
  return track as HTMLElement;
}

function getActiveThumbnailIndices() {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-rmg-thumb-index][data-active='true']"
    )
  ).map((node) => Number(node.getAttribute("data-rmg-thumb-index")));
}

beforeAll(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 16)
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    window.clearTimeout(id);
  });
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.stubGlobal("visualViewport", {
    addEventListener() {},
    removeEventListener() {},
  });
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));

  if (typeof window.PointerEvent === "undefined") {
    vi.stubGlobal("PointerEvent", MouseEvent);
  }

  if (typeof globalThis.CSS === "undefined" || typeof globalThis.CSS.escape !== "function") {
    vi.stubGlobal("CSS", { escape: (value: string) => value });
  }

  getBoundingClientRectSpy = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function mockGetBoundingClientRect(this: HTMLElement) {
      return createRect(this);
    });

  originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
  originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
  originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");

  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return Math.round(createRect(this).width);
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return Math.round(createRect(this).height);
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return Math.round(createRect(this).width);
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return Math.round(createRect(this).height);
    },
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  resizeObservers = [];
  vi.clearAllTimers();
  vi.clearAllMocks();
});

afterAll(() => {
  getBoundingClientRectSpy?.mockRestore();

  if (originalClientWidth) {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
  }
  if (originalClientHeight) {
    Object.defineProperty(HTMLElement.prototype, "clientHeight", originalClientHeight);
  }
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", originalOffsetWidth);
  }
  if (originalOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalOffsetHeight);
  }

  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("thumbnail crossfade distance", () => {
  test("keeps thumbnail selections scrolling when crossfade is omitted or disabled", () => {
    expect(
      shouldUseThumbnailCrossfade({
        fromIndex: 0,
        toIndex: 4,
        count: 5,
      })
    ).toBe(false);

    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: false },
        fromIndex: 0,
        toIndex: 4,
        count: 5,
      })
    ).toBe(false);
  });

  test("preserves all-selection crossfade when no minimum distance is set", () => {
    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: true },
        fromIndex: 2,
        toIndex: 2,
        count: 5,
      })
    ).toBe(true);

    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: true },
        fromIndex: 2,
        toIndex: 3,
        count: 5,
      })
    ).toBe(true);
  });

  test("uses an inclusive minimum distance threshold", () => {
    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: true, minDistance: 3 },
        fromIndex: 1,
        toIndex: 2,
        count: 6,
      })
    ).toBe(false);

    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: true, minDistance: 3 },
        fromIndex: 1,
        toIndex: 3,
        count: 6,
      })
    ).toBe(false);

    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: true, minDistance: 3 },
        fromIndex: 1,
        toIndex: 4,
        count: 6,
      })
    ).toBe(true);
  });

  test("uses shortest circular distance when looping", () => {
    expect(
      resolveThumbnailIndexDistance({
        fromIndex: 0,
        toIndex: 5,
        count: 6,
        loop: true,
      })
    ).toBe(1);

    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: true, minDistance: 3 },
        fromIndex: 0,
        toIndex: 5,
        count: 6,
        loop: true,
      })
    ).toBe(false);

    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: true, minDistance: 3 },
        fromIndex: 0,
        toIndex: 3,
        count: 6,
        loop: true,
      })
    ).toBe(true);
  });

  test("normalizes minimum distance values", () => {
    expect(resolveThumbnailCrossfadeMinDistance(3.8)).toBe(3);
    expect(resolveThumbnailCrossfadeMinDistance(-2)).toBe(0);
    expect(resolveThumbnailCrossfadeMinDistance(Number.NaN)).toBeNull();

    expect(
      shouldUseThumbnailCrossfade({
        crossfade: { enabled: true, minDistance: Number.NaN },
        fromIndex: 0,
        toIndex: 1,
        count: 3,
      })
    ).toBe(true);
  });
});

describe("thumbnail sync fading", () => {
  test("resolves the actual visible thumbnail window from scroll layout", () => {
    const items = Array.from({ length: 12 }, (_, index) => ({
      index,
      start: index * 76,
      end: index * 76 + 68,
    }));
    const visibleIndices = resolveThumbnailVisibleIndicesForScroll({
      items,
      scroll: 0,
      viewport: 372,
    });

    expect(visibleIndices).toEqual([0, 1, 2, 3, 4]);
    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: { enabled: true, minDistance: 3 },
        targetIndex: 7,
        visibleIndices,
        count: 12,
      })
    ).toBe(false);
  });

  test("keeps external sync animated when fadeOnSync is omitted or disabled", () => {
    expect(
      shouldFadeThumbnailSync({
        targetIndex: 9,
        visibleIndices: [2, 3, 4],
        count: 10,
      })
    ).toBe(false);

    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: false,
        targetIndex: 9,
        visibleIndices: [2, 3, 4],
        count: 10,
      })
    ).toBe(false);

    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: { enabled: false, minDistance: 0 },
        targetIndex: 9,
        visibleIndices: [2, 3, 4],
        count: 10,
      })
    ).toBe(false);
  });

  test("keeps external sync animated when the target is inside the current visible window", () => {
    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: true,
        targetIndex: 3,
        visibleIndices: [2, 3, 4],
        count: 10,
      })
    ).toBe(false);
  });

  test("keeps external sync animated within the minDistance window margin", () => {
    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: { enabled: true, minDistance: 2 },
        targetIndex: 2,
        visibleIndices: [4, 5, 6],
        count: 10,
      })
    ).toBe(false);

    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: { enabled: true, minDistance: 2 },
        targetIndex: 8,
        visibleIndices: [4, 5, 6],
        count: 10,
      })
    ).toBe(false);
  });

  test("fades external sync beyond the minDistance window margin", () => {
    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: { enabled: true, minDistance: 2 },
        targetIndex: 1,
        visibleIndices: [4, 5, 6],
        count: 10,
      })
    ).toBe(true);

    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: { enabled: true, minDistance: 2 },
        targetIndex: 9,
        visibleIndices: [4, 5, 6],
        count: 10,
      })
    ).toBe(true);
  });

  test("uses shortest circular distance when looping", () => {
    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: { enabled: true, minDistance: 1 },
        targetIndex: 9,
        visibleIndices: [0, 1, 2],
        count: 10,
        loop: true,
      })
    ).toBe(false);

    expect(
      shouldFadeThumbnailSync({
        fadeOnSync: { enabled: true, minDistance: 1 },
        targetIndex: 7,
        visibleIndices: [0, 1, 2],
        count: 10,
        loop: true,
      })
    ).toBe(true);
  });

  test("normalizes fadeOnSync options", () => {
    expect(resolveThumbnailFadeOnSyncOptions(true)).toEqual({
      enabled: true,
      minDistance: 0,
      durationMs: 220,
      easing: "cubic-bezier(.4,0,.22,1)",
    });
    expect(resolveThumbnailFadeOnSyncOptions(undefined)).toEqual({
      enabled: false,
      minDistance: 0,
      durationMs: 220,
      easing: "cubic-bezier(.4,0,.22,1)",
    });
    expect(
      resolveThumbnailFadeOnSyncOptions({
        enabled: true,
        minDistance: 3.8,
        durationMs: 175.5,
        easing: "linear",
      })
    ).toEqual({
      enabled: true,
      minDistance: 3,
      durationMs: 175.5,
      easing: "linear",
    });
    expect(
      resolveThumbnailFadeOnSyncOptions({
        enabled: true,
        minDistance: Number.NaN,
        durationMs: Number.NaN,
        easing: "",
      })
    ).toEqual({
      enabled: true,
      minDistance: 0,
      durationMs: 220,
      easing: "cubic-bezier(.4,0,.22,1)",
    });
  });
});

describe("thumbnail sync fade component behavior", () => {
  test("centers short padded horizontal rails in the content box", async () => {
    const view = await setup(
      React.createElement(
        ThumbnailSlider,
        {
          position: "bottom",
          thumbnailWidth: 100,
          thumbnailHeight: SYNC_TEST_THUMB_SIZE,
          thumbnailsContainerWidth: 500,
          thumbnailsContainerHeight: SYNC_TEST_THUMB_SIZE,
          thumbnailsContainerStyle: {
            paddingLeft: "50px",
            paddingRight: "50px",
          },
          thumbnailsCenter: true,
          gap: SYNC_TEST_GAP,
          selectDuration: 0,
          freeScrollDuration: 0,
          sliderFriction: 1,
        },
        ...createThumbItems(3)
      )
    );

    const track = getThumbnailTrack();
    expect(track.style.transform).toContain("42px");

    await view.cleanup();
  });

  test("clamps padded horizontal rails at the content-box end", async () => {
    const indexChannel = createSliderIndexChannel(0, "instant");
    const view = await setup(
      React.createElement(
        ThumbnailSlider,
        {
          position: "bottom",
          thumbnailWidth: 100,
          thumbnailHeight: SYNC_TEST_THUMB_SIZE,
          thumbnailsContainerWidth: 300,
          thumbnailsContainerHeight: SYNC_TEST_THUMB_SIZE,
          thumbnailsContainerStyle: {
            paddingLeft: "50px",
            paddingRight: "50px",
          },
          indexChannel,
          centerActiveThumb: true,
          gap: SYNC_TEST_GAP,
          selectDuration: 0,
          freeScrollDuration: 0,
          sliderFriction: 1,
        },
        ...createThumbItems(5)
      )
    );

    await React.act(async () => {
      indexChannel.set(4, "instant");
      vi.advanceTimersByTime(32);
      await Promise.resolve();
    });
    await settle(2);

    const track = getThumbnailTrack();
    expect(track.style.transform).toContain("-332px");

    await view.cleanup();
  });

  test("crossfades a far external index sync after instant hidden rail reposition", async () => {
    const indexChannel = createSliderIndexChannel(0, "animated");
    const view = await setup(
      React.createElement(
        ThumbnailSlider,
        {
          position: "bottom",
          thumbnailWidth: SYNC_TEST_THUMB_SIZE,
          thumbnailHeight: SYNC_TEST_THUMB_SIZE,
          thumbnailsContainerWidth: SYNC_TEST_CONTAINER_WIDTH,
          thumbnailsContainerHeight: SYNC_TEST_THUMB_SIZE,
          gap: SYNC_TEST_GAP,
          indexChannel,
          fadeOnSync: {
            enabled: true,
            minDistance: 0,
            durationMs: 120,
            easing: "linear",
          },
          selectDuration: 25,
          freeScrollDuration: 25,
          sliderFriction: 1,
        },
        ...createThumbItems(12)
      )
    );

    const track = getThumbnailTrack();
    expect(document.querySelector("[data-rmg-thumb-sync-fade-overlay='true']")).toBeNull();

    await React.act(async () => {
      indexChannel.set(8, "animated");
      vi.advanceTimersByTime(16);
      await Promise.resolve();
    });

    let overlay = document.querySelector<HTMLElement>(
      "[data-rmg-thumb-sync-fade-overlay='true']"
    );
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute("data-rmg-thumb-sync-fade-phase")).toBe("hold");
    expect(track.style.opacity).toBe("0");
    expect(track.style.transform).toContain("-532px");
    expect(
      Array.from(
        overlay?.querySelectorAll<HTMLElement>("[data-rmg-thumb-sync-fade-index]") ??
          []
      ).map((node) => Number(node.getAttribute("data-rmg-thumb-sync-fade-index")))
    ).toEqual([0, 1, 2, 3, 4]);

    await React.act(async () => {
      vi.advanceTimersByTime(32);
      await Promise.resolve();
    });

    overlay = document.querySelector<HTMLElement>(
      "[data-rmg-thumb-sync-fade-overlay='true']"
    );
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute("data-rmg-thumb-sync-fade-phase")).toBe("fade");
    expect(overlay?.style.opacity).toBe("0");
    expect(track.style.opacity).toBe("1");
    expect(track.style.transition).toContain("opacity 120ms linear");

    await React.act(async () => {
      vi.advanceTimersByTime(220);
      await Promise.resolve();
    });

    expect(document.querySelector("[data-rmg-thumb-sync-fade-overlay='true']")).toBeNull();

    await view.cleanup();
  });

  test("keeps the synced thumbnail selected after a virtualized fadeOnSync rebuild", async () => {
    const indexChannel = createSliderIndexChannel(0, "animated");
    const view = await setup(
      React.createElement(
        ThumbnailSlider,
        {
          position: "bottom",
          thumbnailWidth: SYNC_TEST_THUMB_SIZE,
          thumbnailHeight: SYNC_TEST_THUMB_SIZE,
          thumbnailsContainerWidth: SYNC_TEST_CONTAINER_WIDTH,
          thumbnailsContainerHeight: SYNC_TEST_THUMB_SIZE,
          gap: SYNC_TEST_GAP,
          indexChannel,
          centerActiveThumb: true,
          loop: true,
          fadeOnSync: {
            enabled: true,
            minDistance: 0,
            durationMs: 120,
            easing: "linear",
          },
          selectDuration: 25,
          freeScrollDuration: 25,
          sliderFriction: 1,
          virtualization: {
            enabled: true,
            overscan: 1,
            threshold: 5,
          },
        },
        ...createThumbItems(18)
      )
    );

    expect(getActiveThumbnailIndices()).toEqual([0]);

    await React.act(async () => {
      indexChannel.set(14, "animated");
      vi.advanceTimersByTime(16);
      await Promise.resolve();
    });
    await settle(2);

    const activeIndices = getActiveThumbnailIndices();
    expect(activeIndices.length).toBeGreaterThan(0);
    expect(activeIndices.every((index) => index === 14)).toBe(true);

    await view.cleanup();
  });

  test("virtualized item rendering only creates the visible thumbnail window", async () => {
    const rendered = new Set<number>();
    const items = Array.from({ length: 18 }, (_, index) => ({
      id: `item-${index}`,
      label: `Item ${index}`,
    }));

    const view = await setup(
      React.createElement(ThumbnailSlider, {
        position: "bottom",
        items,
        renderItem: ({ item, index }: any) => {
          rendered.add(index);
          return React.createElement(
            "div",
            {
              "data-thumb-rendered": index,
              style: {
                width: "100%",
                height: "100%",
              },
            },
            item.label
          );
        },
        getItemKey: (item: any) => item.id,
        thumbnailWidth: SYNC_TEST_THUMB_SIZE,
        thumbnailHeight: SYNC_TEST_THUMB_SIZE,
        thumbnailsContainerWidth: SYNC_TEST_CONTAINER_WIDTH,
        thumbnailsContainerHeight: SYNC_TEST_THUMB_SIZE,
        gap: SYNC_TEST_GAP,
        loop: true,
        virtualization: {
          enabled: true,
          overscan: 1,
          threshold: 5,
        },
      })
    );

    const thumbs = document.querySelectorAll("[data-thumb-rendered]");
    expect(thumbs.length).toBeGreaterThan(0);
    expect(thumbs.length).toBeLessThan(items.length);
    expect(rendered.size).toBeLessThan(items.length);

    await view.cleanup();
  });

  test("keeps children-based thumbnail rendering working", async () => {
    const view = await setup(
      React.createElement(
        ThumbnailSlider,
        {
          position: "bottom",
          thumbnailWidth: SYNC_TEST_THUMB_SIZE,
          thumbnailHeight: SYNC_TEST_THUMB_SIZE,
          thumbnailsContainerWidth: SYNC_TEST_CONTAINER_WIDTH,
          thumbnailsContainerHeight: SYNC_TEST_THUMB_SIZE,
          gap: SYNC_TEST_GAP,
          loop: false,
        },
        ...createThumbItems(4)
      )
    );

    expect(document.querySelectorAll("[data-rmg-thumb-index]")).toHaveLength(4);

    await view.cleanup();
  });
});
