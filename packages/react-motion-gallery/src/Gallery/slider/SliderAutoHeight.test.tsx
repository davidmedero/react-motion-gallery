// @vitest-environment jsdom

import * as React from "react";
import { createRoot } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { BREAKPOINT_MAP } from "../shared/responsive";
import SliderCore from "./Slider";
import { Slider } from "./index";
import createIndexChannel from "./sliderSub";
import type { SliderHandle } from "./types";

type ResizeObserverEntryLike = {
  target: Element;
  contentRect: DOMRect;
};

const VIEWPORT_WIDTH = 700;
const SLIDE_WIDTH = 320;
const FRACTIONAL_AUTO_HEIGHT = 123.4567;

let resizeObservers: MockResizeObserver[] = [];
let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn>;
let originalClientWidth: PropertyDescriptor | undefined;
let originalClientHeight: PropertyDescriptor | undefined;
let originalOffsetWidth: PropertyDescriptor | undefined;
let originalOffsetHeight: PropertyDescriptor | undefined;
let originalOffsetLeft: PropertyDescriptor | undefined;

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

function parsePixels(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function makeRect(args: {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
} = {}): DOMRect {
  const left = args.left ?? 0;
  const top = args.top ?? 0;
  const width = args.width ?? 0;
  const height = args.height ?? 0;

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

function createRect(el: HTMLElement): DOMRect {
  if (el.getAttribute("data-rmg-part") === "viewport") {
    return makeRect({
      width: VIEWPORT_WIDTH,
      height: parsePixels(el.style.height) ?? 0,
    });
  }

  if (el.hasAttribute("data-rmg-slide")) {
    return makeRect({
      width: SLIDE_WIDTH,
      height: FRACTIONAL_AUTO_HEIGHT,
    });
  }

  if (el.getAttribute("data-testid") === "auto-height-card") {
    const explicitHeight = Number.parseFloat(el.getAttribute("data-auto-height") ?? "");
    return makeRect({
      width: SLIDE_WIDTH,
      height: Number.isFinite(explicitHeight) ? explicitHeight : FRACTIONAL_AUTO_HEIGHT,
    });
  }

  if (el.getAttribute("data-rmg-axis") === "x") {
    return makeRect({ width: VIEWPORT_WIDTH, height: FRACTIONAL_AUTO_HEIGHT });
  }

  return makeRect({ width: VIEWPORT_WIDTH });
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

async function settle(cycles = 10) {
  for (let i = 0; i < cycles; i++) {
    await React.act(async () => {
      triggerResizeObservers();
      vi.advanceTimersByTime(32);
      await Promise.resolve();
    });
  }
}

function AutoHeightSliderFixture() {
  const [ready, setReady] = React.useState(false);
  const isClick = React.useRef(false);
  const overlayDivRef = React.useRef<HTMLDivElement | null>(null);
  const duplicateImgRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLElement | null>(null);
  const counterRef = React.useRef<HTMLElement | null>(null);
  const leftChevronRef = React.useRef<HTMLElement | null>(null);
  const rightChevronRef = React.useRef<HTMLElement | null>(null);

  return (
    <SliderCore
      cellCount={1}
      isClick={isClick}
      overlayDivRef={overlayDivRef}
      duplicateImgRef={duplicateImgRef}
      closeButtonRef={closeButtonRef}
      counterRef={counterRef}
      leftChevronRef={leftChevronRef}
      rightChevronRef={rightChevronRef}
      isReady={ready}
      setIsReady={setReady}
      loop={false}
      freeScroll={false}
      autoPlay={false}
      autoPlaySpeed={3000}
      autoPlayPause={1000}
      autoScroll={false}
      autoScrollSpeed={0.3}
      autoScrollPause={1000}
      autoHeight
      autoHeightDuration="320ms"
      autoHeightEasing="ease"
      gap={0}
      showArrows={false}
      showDots={false}
      selectDuration={0}
      freeScrollDuration={0}
      sliderFriction={1}
      direction="ltr"
      axis="x"
      sliderImagesReady
      breakpointMap={BREAKPOINT_MAP}
      isFullscreenOpen={false}
      setFullscreenOpen={() => {}}
    >
      <article data-testid="auto-height-card">Fractional height card</article>
    </SliderCore>
  );
}

function AutoHeightLoopFixture({
  indexChannel,
  sliderRef,
}: {
  indexChannel: ReturnType<typeof createIndexChannel>;
  sliderRef: React.RefObject<SliderHandle | null>;
}) {
  const [ready, setReady] = React.useState(false);
  const isClick = React.useRef(false);
  const overlayDivRef = React.useRef<HTMLDivElement | null>(null);
  const duplicateImgRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLElement | null>(null);
  const counterRef = React.useRef<HTMLElement | null>(null);
  const leftChevronRef = React.useRef<HTMLElement | null>(null);
  const rightChevronRef = React.useRef<HTMLElement | null>(null);

  return (
    <SliderCore
      ref={sliderRef}
      cellCount={3}
      isClick={isClick}
      overlayDivRef={overlayDivRef}
      duplicateImgRef={duplicateImgRef}
      closeButtonRef={closeButtonRef}
      counterRef={counterRef}
      leftChevronRef={leftChevronRef}
      rightChevronRef={rightChevronRef}
      isReady={ready}
      setIsReady={setReady}
      loop
      freeScroll={false}
      autoPlay={false}
      autoPlaySpeed={3000}
      autoPlayPause={1000}
      autoScroll={false}
      autoScrollSpeed={0.3}
      autoScrollPause={1000}
      autoHeight
      autoHeightDuration="320ms"
      autoHeightEasing="ease"
      gap={0}
      showArrows={false}
      showDots={false}
      selectDuration={25}
      freeScrollDuration={0}
      sliderFriction={0.6}
      direction="ltr"
      axis="x"
      sliderImagesReady
      breakpointMap={BREAKPOINT_MAP}
      indexChannel={indexChannel}
      indexChannelControlled
      isFullscreenOpen={false}
      setFullscreenOpen={() => {}}
    >
      <article data-testid="auto-height-card" data-auto-height="123.4567">One</article>
      <article data-testid="auto-height-card" data-auto-height="178.25">Two</article>
      <article data-testid="auto-height-card" data-auto-height="142.75">Three</article>
    </SliderCore>
  );
}

function InitialIndexSliderFixture({
  sliderRef,
}: {
  sliderRef: React.RefObject<SliderHandle | null>;
}) {
  return (
    <Slider
      ref={sliderRef}
      initialIndex={3}
      layout={{ gap: 0 }}
      motion={{ selectDuration: 0, freeScrollDuration: 0, friction: 1 }}
    >
      <article data-testid="auto-height-card">One</article>
      <article data-testid="auto-height-card">Two</article>
      <article data-testid="auto-height-card">Three</article>
      <article data-testid="auto-height-card">Four</article>
      <article data-testid="auto-height-card">Five</article>
      <article data-testid="auto-height-card">Six</article>
    </Slider>
  );
}

async function renderSlider() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  await React.act(async () => {
    root.render(<AutoHeightSliderFixture />);
  });
  await settle();

  return {
    host,
    cleanup: async () => {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    },
  };
}

async function renderLoopSlider() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const indexChannel = createIndexChannel();
  const sliderRef = React.createRef<SliderHandle>();

  await React.act(async () => {
    root.render(<AutoHeightLoopFixture indexChannel={indexChannel} sliderRef={sliderRef} />);
  });
  await settle();

  return {
    host,
    indexChannel,
    sliderRef,
    cleanup: async () => {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    },
  };
}

async function renderInitialIndexSlider() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const sliderRef = React.createRef<SliderHandle>();

  await React.act(async () => {
    root.render(<InitialIndexSliderFixture sliderRef={sliderRef} />);
  });
  await settle();

  return {
    host,
    sliderRef,
    cleanup: async () => {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    },
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
  vi.stubGlobal("visualViewport", {
    addEventListener() {},
    removeEventListener() {},
  });

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
  originalOffsetLeft = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetLeft");

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
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    get() {
      const renderedIndex = Number.parseInt(this.getAttribute("data-rmg-rendered-idx") ?? "", 10);
      return Number.isFinite(renderedIndex) ? renderedIndex * SLIDE_WIDTH : 0;
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
  if (originalOffsetLeft) {
    Object.defineProperty(HTMLElement.prototype, "offsetLeft", originalOffsetLeft);
  }

  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Slider autoHeight", () => {
  test("preserves stable fractional viewport heights", async () => {
    const view = await renderSlider();

    try {
      const viewport = view.host.querySelector<HTMLElement>('[data-rmg-part="viewport"]');

      expect(viewport?.style.height).toBe("123.457px");
      expect(viewport?.style.height).not.toBe("124px");
      expect(viewport?.style.transition).toBe("none");
    } finally {
      await view.cleanup();
    }
  });

  test("does not instant reanchor animated navigation after height-only resize", async () => {
    const view = await renderLoopSlider();

    try {
      const track = view.host.querySelector<HTMLElement>('[data-rmg-axis="x"]');

      expect(track).not.toBeNull();
      expect(track?.style.transform).toContain("0px");

      await React.act(async () => {
        view.indexChannel.set(1, "animated");
        vi.advanceTimersByTime(16);
        await Promise.resolve();
      });

      await React.act(async () => {
        triggerResizeObservers();
        await Promise.resolve();
      });

      expect(track?.style.transform).not.toContain("-320px");
    } finally {
      await view.cleanup();
    }
  });

  test("animates auto-height after the initial settled measurement", async () => {
    const view = await renderLoopSlider();

    try {
      const viewport = view.host.querySelector<HTMLElement>('[data-rmg-part="viewport"]');

      expect(viewport?.style.height).toBe("123.457px");
      expect(viewport?.style.transition).toBe("none");
      expect(view.sliderRef.current?.isReady()).toBe(true);

      await React.act(async () => {
        view.sliderRef.current?.setIndex(1, "animated");
        vi.advanceTimersByTime(16);
        await Promise.resolve();
      });
      await settle(4);

      expect(view.sliderRef.current?.getIndex()).toBe(1);
      expect(viewport?.style.height).toBe("178.25px");
      expect(viewport?.style.transition).toContain("height 320ms ease");
    } finally {
      await view.cleanup();
    }
  });

  test("starts at the requested initialIndex before first paint settles", async () => {
    const view = await renderInitialIndexSlider();

    try {
      const track = view.host.querySelector<HTMLElement>('[data-rmg-axis="x"]');

      expect(view.sliderRef.current?.getIndex()).toBe(3);
      expect(track?.style.transform).toContain("-960px");
    } finally {
      await view.cleanup();
    }
  });
});
