// @vitest-environment jsdom

import * as React from "react";
import { createRoot } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import ThumbnailSlider from "./ThumbnailSlider";
import ThumbnailSliderShell from "./index";
import createSliderIndexChannel from "../slider/sliderSub";
import styles from "./Thumbnails.module.css";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

type SetupResult = {
  cleanup: () => Promise<void>;
  getImages: () => HTMLImageElement[];
  render: (node: React.ReactNode) => Promise<void>;
};

type ResizeObserverEntryLike = {
  target: Element;
  contentRect: DOMRect;
};

type ImageBehavior = {
  complete: boolean;
  naturalWidth: number;
  decodeImpl: () => Promise<void>;
};

const DEFAULT_CONTAINER_WIDTH = 320;
const DEFAULT_THUMB_WIDTH = 96;
const DEFAULT_THUMB_HEIGHT = 60;

let imageBehavior: ImageBehavior = {
  complete: true,
  naturalWidth: 1200,
  decodeImpl: async () => {},
};

let resizeObservers: MockResizeObserver[] = [];
let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn>;
let originalClientWidth: PropertyDescriptor | undefined;
let originalClientHeight: PropertyDescriptor | undefined;
let originalOffsetWidth: PropertyDescriptor | undefined;
let originalOffsetHeight: PropertyDescriptor | undefined;
let originalNaturalWidth: PropertyDescriptor | undefined;
let originalComplete: PropertyDescriptor | undefined;
let originalDecode: PropertyDescriptor | undefined;

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
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
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

function createDeferred<T>(): Deferred<T> {
  let resolve!: Deferred<T>["resolve"];
  let reject!: Deferred<T>["reject"];

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function parsePixels(value: string | null | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith("px")) {
    const parsed = Number.parseFloat(trimmed.slice(0, -2));
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readElementWidth(el: HTMLElement): number {
  const explicit = parsePixels(el.style.width);
  if (explicit != null) return explicit;

  if (el.style.width === "100%") {
    const parent = el.parentElement;
    return parent instanceof HTMLElement ? readElementWidth(parent) : DEFAULT_CONTAINER_WIDTH;
  }

  if (el.tagName === "IMG" || el.tagName === "VIDEO") {
    const parent = el.parentElement;
    return parent instanceof HTMLElement ? readElementWidth(parent) : DEFAULT_THUMB_WIDTH;
  }

  return 0;
}

function readElementHeight(el: HTMLElement): number {
  const explicit = parsePixels(el.style.height);
  if (explicit != null) return explicit;

  if (el.style.height === "100%") {
    const parent = el.parentElement;
    return parent instanceof HTMLElement ? readElementHeight(parent) : DEFAULT_THUMB_HEIGHT;
  }

  if (el.tagName === "IMG" || el.tagName === "VIDEO") {
    const parent = el.parentElement;
    return parent instanceof HTMLElement ? readElementHeight(parent) : DEFAULT_THUMB_HEIGHT;
  }

  return 0;
}

function createRect(el: HTMLElement): DOMRect {
  const width = readElementWidth(el);
  const height = readElementHeight(el);

  return {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
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

function lastReadyState(spy: ReturnType<typeof vi.fn>) {
  const lastCall = spy.mock.calls.at(-1);
  return lastCall?.[0];
}

function createSliderNode(onReadyChange: (ready: boolean) => void, src = "/thumb-a.jpg") {
  return (
    <ThumbnailSlider
      position="bottom"
      thumbnailWidth={DEFAULT_THUMB_WIDTH}
      thumbnailHeight={DEFAULT_THUMB_HEIGHT}
      thumbnailsContainerWidth={DEFAULT_CONTAINER_WIDTH}
      selectDuration={0}
      freeScrollDuration={0}
      sliderFriction={1}
      onReadyChange={onReadyChange}
    >
      <img key="thumb" src={src} alt="Thumb" />
    </ThumbnailSlider>
  );
}

async function setup(node: React.ReactNode): Promise<SetupResult> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  async function render(nextNode: React.ReactNode) {
    await React.act(async () => {
      root.render(nextNode);
    });
    await settle();
  }

  await render(node);

  return {
    cleanup: async () => {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    },
    getImages: () => Array.from(host.querySelectorAll("img")),
    render,
  };
}

beforeAll(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    return window.setTimeout(() => cb(performance.now()), 16);
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    window.clearTimeout(id);
  });
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.stubGlobal("visualViewport", {
    addEventListener() {},
    removeEventListener() {},
  });

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
  originalNaturalWidth = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    "naturalWidth"
  );
  originalComplete = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "complete");
  originalDecode = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "decode");

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
  Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
    configurable: true,
    get() {
      return imageBehavior.naturalWidth;
    },
  });
  Object.defineProperty(HTMLImageElement.prototype, "complete", {
    configurable: true,
    get() {
      return imageBehavior.complete;
    },
  });
  Object.defineProperty(HTMLImageElement.prototype, "decode", {
    configurable: true,
    value() {
      return imageBehavior.decodeImpl();
    },
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  resizeObservers = [];
  imageBehavior = {
    complete: true,
    naturalWidth: 1200,
    decodeImpl: async () => {},
  };
  vi.clearAllTimers();
  vi.clearAllMocks();
});

afterAll(() => {
  getBoundingClientRectSpy.mockRestore();

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
  if (originalNaturalWidth) {
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", originalNaturalWidth);
  }
  if (originalComplete) {
    Object.defineProperty(HTMLImageElement.prototype, "complete", originalComplete);
  }
  if (originalDecode) {
    Object.defineProperty(HTMLImageElement.prototype, "decode", originalDecode);
  }

  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function createThumbItems(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <img key={`thumb-${index}`} src={`/thumb-${index}.jpg`} alt={`Thumb ${index}`} />
  ));
}

function renderedThumbIndexes() {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-rmg-thumb-rendered-index]")
  ).map((node) => Number(node.getAttribute("data-rmg-thumb-rendered-index")));
}

describe("ThumbnailSlider virtualization", () => {
  test("falls back to full rendering when fixed thumbnail size cannot be measured", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const view = await setup(
      <ThumbnailSlider
        position="bottom"
        thumbnailHeight={DEFAULT_THUMB_HEIGHT}
        thumbnailsContainerWidth={DEFAULT_CONTAINER_WIDTH}
        selectDuration={0}
        freeScrollDuration={0}
        sliderFriction={1}
        virtualization={{ enabled: true, threshold: 5 }}
      >
        {createThumbItems(12)}
      </ThumbnailSlider>
    );

    expect(document.querySelectorAll("[data-rmg-thumb-index]")).toHaveLength(12);
    expect(document.querySelector("[data-rmg-thumb-virtual='true']")).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Thumbnail virtualization")
    );

    warnSpy.mockRestore();
    await view.cleanup();
  });

  test("windows fixed-size thumbnails and updates the window from wheel coordinates", async () => {
    const view = await setup(
      <ThumbnailSlider
        position="bottom"
        thumbnailWidth={DEFAULT_THUMB_WIDTH}
        thumbnailHeight={DEFAULT_THUMB_HEIGHT}
        thumbnailsContainerWidth={DEFAULT_CONTAINER_WIDTH}
        gap={8}
        selectDuration={0}
        freeScrollDuration={0}
        sliderFriction={1}
        virtualization={{ enabled: true, overscan: 1, threshold: 5 }}
      >
        {createThumbItems(30)}
      </ThumbnailSlider>
    );

    const virtualThumbs = document.querySelectorAll("[data-rmg-thumb-virtual='true']");
    expect(virtualThumbs.length).toBeGreaterThan(0);
    expect(virtualThumbs.length).toBeLessThan(30);
    expect(renderedThumbIndexes()).toContain(0);

    const root = document.querySelector<HTMLElement>("[data-rmg-thumb-core-scope]");
    expect(root).not.toBeNull();

    await React.act(async () => {
      root?.dispatchEvent(
        new WheelEvent("wheel", {
          deltaX: 900,
          bubbles: true,
          cancelable: true,
        })
      );
      vi.advanceTimersByTime(32);
      await Promise.resolve();
    });
    await settle(4);

    const nextIndexes = renderedThumbIndexes();
    expect(nextIndexes.some((index) => index > 5)).toBe(true);
    expect(nextIndexes.length).toBeLessThan(30);

    await view.cleanup();
  });
});

describe("ThumbnailSlider base channel sync", () => {
  test("does not rerun non-virtual measurement when the active base index changes", async () => {
    const indexChannel = createSliderIndexChannel(0, "instant");
    const view = await setup(
      <ThumbnailSlider
        position="left"
        thumbnailWidth={72}
        thumbnailHeight={108}
        thumbnailsContainerHeight={360}
        centerActiveThumb
        gap={10}
        selectDuration={0}
        freeScrollDuration={0}
        sliderFriction={1}
        indexChannel={indexChannel}
      >
        {createThumbItems(6)}
      </ThumbnailSlider>
    );

    const observerCount = resizeObservers.length;

    await React.act(async () => {
      indexChannel.set(2, "animated");
      vi.advanceTimersByTime(32);
      await Promise.resolve();
    });
    await settle(2);

    expect(resizeObservers).toHaveLength(observerCount);

    await view.cleanup();
  });
});

describe("ThumbnailSlider readiness", () => {
  test("waits for thumbnail image decode before reporting ready", async () => {
    const deferred = createDeferred<void>();
    imageBehavior.decodeImpl = () => deferred.promise;

    const onReadyChange = vi.fn();
    const view = await setup(createSliderNode(onReadyChange));

    expect(onReadyChange).toHaveBeenCalledWith(false);
    expect(onReadyChange).not.toHaveBeenCalledWith(true);

    deferred.resolve();
    await settle();

    expect(lastReadyState(onReadyChange)).toBe(true);

    await view.cleanup();
  });

  test("reports ready promptly for cached thumbnail images", async () => {
    imageBehavior.decodeImpl = async () => {};

    const onReadyChange = vi.fn();
    const view = await setup(createSliderNode(onReadyChange));

    expect(lastReadyState(onReadyChange)).toBe(true);

    await view.cleanup();
  });

  test("keeps auto-height horizontal rails from collapsing after measurement", async () => {
    const view = await setup(
      <ThumbnailSlider
        position="bottom"
        thumbnailWidth={DEFAULT_THUMB_WIDTH}
        thumbnailHeight={DEFAULT_THUMB_HEIGHT}
        thumbnailsContainerWidth={DEFAULT_CONTAINER_WIDTH}
        selectDuration={0}
        freeScrollDuration={0}
        sliderFriction={1}
      >
        {createThumbItems(4)}
      </ThumbnailSlider>
    );

    const root = document.querySelector<HTMLElement>("[data-rmg-thumb-core-scope]");
    expect(root?.style.height).toBe("");
    expect(root?.style.minHeight).toBe(`${DEFAULT_THUMB_HEIGHT}px`);

    await view.cleanup();
  });

  test("includes container padding in auto-height horizontal rails", async () => {
    const view = await setup(
      <ThumbnailSlider
        position="bottom"
        thumbnailWidth={DEFAULT_THUMB_WIDTH}
        thumbnailHeight={DEFAULT_THUMB_HEIGHT}
        thumbnailsContainerWidth={DEFAULT_CONTAINER_WIDTH}
        thumbnailsContainerStyle={{ padding: "8px 12px" }}
        selectDuration={0}
        freeScrollDuration={0}
        sliderFriction={1}
      >
        {createThumbItems(4)}
      </ThumbnailSlider>
    );

    const root = document.querySelector<HTMLElement>("[data-rmg-thumb-core-scope]");
    expect(root?.style.minHeight).toBe("76px");

    await view.cleanup();
  });

  test("includes container padding and border in auto-height horizontal rails", async () => {
    const view = await setup(
      <ThumbnailSlider
        position="bottom"
        thumbnailWidth={104}
        thumbnailHeight={64}
        thumbnailsContainerWidth={DEFAULT_CONTAINER_WIDTH}
        thumbnailsContainerStyle={{
          padding: "10px 12px 14px",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        }}
        selectDuration={0}
        freeScrollDuration={0}
        sliderFriction={1}
      >
        {createThumbItems(4)}
      </ThumbnailSlider>
    );

    const root = document.querySelector<HTMLElement>("[data-rmg-thumb-core-scope]");
    expect(root?.style.minHeight).toBe("89px");

    await view.cleanup();
  });

  test("does not get stuck when thumbnail images error", async () => {
    imageBehavior.complete = false;
    imageBehavior.naturalWidth = 0;

    const onReadyChange = vi.fn();
    const view = await setup(createSliderNode(onReadyChange));

    expect(onReadyChange).toHaveBeenCalledWith(false);
    expect(onReadyChange).not.toHaveBeenCalledWith(true);

    await React.act(async () => {
      view.getImages().forEach((img) => {
        img.dispatchEvent(new Event("error"));
      });
      await Promise.resolve();
    });
    await settle();

    expect(lastReadyState(onReadyChange)).toBe(true);

    await view.cleanup();
  });

  test("resets and re-waits when thumbnail children change", async () => {
    const firstDeferred = createDeferred<void>();
    imageBehavior.decodeImpl = () => firstDeferred.promise;

    const onReadyChange = vi.fn();
    const view = await setup(createSliderNode(onReadyChange, "/thumb-a.jpg"));

    expect(lastReadyState(onReadyChange)).toBe(false);

    firstDeferred.resolve();
    await settle();

    expect(lastReadyState(onReadyChange)).toBe(true);

    const secondDeferred = createDeferred<void>();
    imageBehavior.decodeImpl = () => secondDeferred.promise;

    await view.render(createSliderNode(onReadyChange, "/thumb-b.jpg"));

    expect(lastReadyState(onReadyChange)).toBe(false);
    expect(onReadyChange.mock.calls.filter(([ready]) => ready === true)).toHaveLength(1);

    secondDeferred.resolve();
    await settle();

    expect(lastReadyState(onReadyChange)).toBe(true);
    expect(onReadyChange.mock.calls.filter(([ready]) => ready === true)).toHaveLength(2);

    await view.cleanup();
  });

  test("keeps thumbnails interactive while the loading layer fades out after ready", async () => {
    const deferred = createDeferred<void>();
    imageBehavior.decodeImpl = () => deferred.promise;

    const onReadyChange = vi.fn();
    const view = await setup(
      <ThumbnailSliderShell
        options={{
          layout: {
            position: "bottom",
            thumbnail: {
              width: DEFAULT_THUMB_WIDTH,
              height: DEFAULT_THUMB_HEIGHT,
            },
            container: {
              width: DEFAULT_CONTAINER_WIDTH,
            },
          },
          motion: {
            selectDuration: 0,
            freeScrollDuration: 0,
            friction: 1,
          },
          transitions: {
            loading: {
              timing: {
                exitMs: 1000,
              },
            },
          },
        }}
        onReadyChange={onReadyChange}
      >
        <img key="thumb" src="/thumb-a.jpg" alt="Thumb" />
      </ThumbnailSliderShell>
    );

    const contentLayerBeforeReady = document.querySelector(`.${styles.thumbContentLayer}`);
    expect(contentLayerBeforeReady?.classList.contains(styles.thumbContentBlocked)).toBe(true);

    deferred.resolve();
    await settle();

    const contentLayerDuringExit = document.querySelector(`.${styles.thumbContentLayer}`);
    const loadingLayerDuringExit = document.querySelector(`.${styles.thumbLoadingLayer}`);

    expect(lastReadyState(onReadyChange)).toBe(true);
    expect(loadingLayerDuringExit).not.toBeNull();
    expect(contentLayerDuringExit?.classList.contains(styles.thumbContentBlocked)).toBe(false);

    await view.cleanup();
  });

  test("keeps compare-mode thumbnails interactive under the persistent loading layer", async () => {
    const deferred = createDeferred<void>();
    imageBehavior.decodeImpl = () => deferred.promise;

    const onReadyChange = vi.fn();
    const view = await setup(
      <ThumbnailSliderShell
        options={{
          layout: {
            position: "bottom",
            thumbnail: {
              width: DEFAULT_THUMB_WIDTH,
              height: DEFAULT_THUMB_HEIGHT,
            },
            container: {
              width: DEFAULT_CONTAINER_WIDTH,
            },
          },
          motion: {
            selectDuration: 0,
            freeScrollDuration: 0,
            friction: 1,
          },
          transitions: {
            loading: {
              force: {
                showContent: true,
                skeletonOpacity: 0.4,
              },
            },
          },
        }}
        onReadyChange={onReadyChange}
      >
        <img key="thumb" src="/thumb-compare.jpg" alt="Thumb Compare" />
      </ThumbnailSliderShell>
    );

    deferred.resolve();
    await settle();

    const contentLayer = document.querySelector(`.${styles.thumbContentLayer}`);
    const loadingLayer = document.querySelector(`.${styles.thumbLoadingLayer}`);

    expect(lastReadyState(onReadyChange)).toBe(true);
    expect(contentLayer?.classList.contains(styles.thumbContentBlocked)).toBe(false);
    expect(loadingLayer).not.toBeNull();
    expect(loadingLayer?.classList.contains(styles.thumbLoadingLayerCompare)).toBe(true);
    expect((loadingLayer as HTMLElement | null)?.style.getPropertyValue("--rmg-thumb-loading-opacity")).toBe("0.4");

    await view.cleanup();
  });
});
