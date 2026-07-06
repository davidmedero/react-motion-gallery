// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { FullscreenSlider } from "./FullscreenSlider";
import { createFullscreenSliderSub } from "./fullscreenSliderSub";
import {
  FULLSCREEN_CLOSE_BODY_LAYER_Z_INDEX,
  FULLSCREEN_TOP_CHROME_Z_INDEX,
} from "./layering";
import type { FullscreenOptions } from "./types";
import type { SliderVirtualizationOptions } from "../shared/virtualTrack";

type ResizeObserverEntryLike = {
  target: Element;
  contentRect: DOMRect;
};

let resizeObservers: MockResizeObserver[] = [];
let viewportWidth = 600;
let viewportHeight = 360;
let viewportLeft = 0;
let viewportTop = 0;

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

function rectAt(left = 0, top = 0, width = viewportWidth, height = viewportHeight): DOMRect {
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

function rect(width = viewportWidth, height = viewportHeight): DOMRect {
  return rectAt(0, 0, width, height);
}

function triggerResizeObservers() {
  for (const observer of resizeObservers) {
    observer.callback(
      Array.from(observer.targets).map((target) => ({
        target,
        contentRect: rect(),
      })),
      observer
    );
  }
}

async function settle(cycles = 2) {
  for (let i = 0; i < cycles; i++) {
    await React.act(async () => {
      triggerResizeObservers();
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function animationFrames(cycles = 2) {
  for (let i = 0; i < cycles; i++) {
    await React.act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });
  }
}

type TestSlideProps = {
  index: number;
  canonicalIndex: number;
  isClone: boolean;
  getTransform: (index: number) => string;
};

function TestSlide({
  index,
  canonicalIndex,
  isClone,
  getTransform,
}: TestSlideProps) {
  return (
    <div
      data-rmg-fs-slide="true"
      data-index={index}
      data-rmg-canonical-idx={canonicalIndex}
      data-rmg-clone={isClone ? "true" : "false"}
      style={{
        position: "absolute",
        minWidth: "100%",
        height: "100%",
        transform: getTransform(index),
      }}
    >
      Slide {canonicalIndex}
    </div>
  );
}

function createWrappedSlides(count: number, gap: number) {
  const getTransform = (index: number) =>
    `translateX(calc(${(index - 1) * 100}% + ${(index - 1) * gap}px))`;

  return [
    <TestSlide
      key="before"
      index={0}
      canonicalIndex={count - 1}
      isClone
      getTransform={getTransform}
    />,
    ...Array.from({ length: count }, (_, index) => (
      <TestSlide
        key={index}
        index={index + 1}
        canonicalIndex={index}
        isClone={false}
        getTransform={getTransform}
      />
    )),
    <TestSlide
      key="after"
      index={count + 1}
      canonicalIndex={0}
      isClone
      getTransform={getTransform}
    />,
  ];
}

const fullscreenOptions = {
  controls: {
    arrows: {
      enabled: false,
    },
  },
} satisfies FullscreenOptions;

type MountFullscreenSliderArgs = {
  count: number;
  fs?: FullscreenOptions;
  virtualization?: SliderVirtualizationOptions;
  initialIndex?: number;
  show?: boolean;
  showFullscreenSlider?: boolean;
  closingModal?: boolean;
  chromeHidden?: boolean;
  chromeStyles?: Record<string, string>;
  sliderGap?: number;
};

function mountFullscreenSlider(args: MountFullscreenSliderArgs) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const initialIndex = args.initialIndex ?? 0;
  const sub = createFullscreenSliderSub(initialIndex);
  let currentArgs = args;

  const rerender = (nextArgs: Partial<MountFullscreenSliderArgs> = {}) => {
    currentArgs = {
      ...currentArgs,
      ...nextArgs,
    };

    const {
      count,
      fs = fullscreenOptions,
      virtualization,
      show = true,
      showFullscreenSlider = true,
      closingModal = false,
      chromeHidden = false,
      chromeStyles = {},
      sliderGap = 24,
    } = currentArgs;

    React.act(() => {
      root.render(
        <FullscreenSlider
          sub={sub}
          cellCount={count}
          slideIndex={initialIndex}
          isClick={{ current: false }}
          isZoomed={false}
          windowSize={{ width: viewportWidth, height: viewportHeight }}
          show={show}
          handleZoomToggle={() => undefined}
          imageRefs={Array.from({ length: count + 2 }, () =>
            React.createRef<HTMLDivElement | null>()
          )}
          cells={{ current: [] }}
          isPinching={{ current: false }}
          scale={1}
          isTouchPinching={{ current: false }}
          showFullscreenSlider={showFullscreenSlider}
          isZooming={{ current: false }}
          plyrRefs={{ current: [] }}
          plyrRef={{ current: [] }}
          closingModal={closingModal}
          counterRef={{ current: null }}
          leftChevronRef={{ current: null }}
          rightChevronRef={{ current: null }}
          overlayDivRef={{ current: null }}
          direction="ltr"
          isWrapping={{ current: false }}
          sliderGap={sliderGap}
          sliderDuration={0}
          sliderFriction={1}
          virtualization={virtualization}
          suppressLoopRef={{ current: false }}
          fadeOpening={false}
          normalizedItems={[]}
          resetAllZoomDom={() => undefined}
          requestFsCloseRef={{ current: null }}
          chromeHidden={chromeHidden}
          fs={fs}
          chromeStyles={chromeStyles}
        >
          {createWrappedSlides(count, sliderGap)}
        </FullscreenSlider>
      );
    });
  };

  rerender();

  return { container, root, sub, rerender };
}

function unmount(root: Root, container: HTMLElement) {
  React.act(() => {
    root.unmount();
  });
  container.remove();
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  (globalThis as any).ResizeObserver = MockResizeObserver;

  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return viewportWidth;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return viewportHeight;
    },
  });

  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (this.getAttribute?.("data-rmg-fs-viewport") === "true") {
        return rectAt(viewportLeft, viewportTop, viewportWidth, viewportHeight);
      }

      return rect();
    }
  );
});

afterEach(() => {
  resizeObservers = [];
  viewportWidth = 600;
  viewportHeight = 360;
  viewportLeft = 0;
  viewportTop = 0;
  document.body.innerHTML = "";
});

afterAll(() => {
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  vi.restoreAllMocks();
});

describe("fullscreen slider virtualization", () => {
  test("recenters active dialog slides when the responsive gap changes", async () => {
    const { container, root, rerender } = mountFullscreenSlider({
      count: 9,
      initialIndex: 8,
      sliderGap: 18,
    });
    await settle();

    const track = container.querySelector<HTMLElement>(
      "[data-rmg-fs-track='true']"
    );

    expect(track?.style.transform).toBe("translate3d(-4944px, 0px, 0)");

    rerender({ sliderGap: 10 });
    await settle();

    expect(track?.style.transform).toBe("translate3d(-4880px, 0px, 0)");

    unmount(root, container);
  });

  test("keeps fullscreen arrow controls above media layers", async () => {
    viewportLeft = 64;
    viewportTop = 28;

    const { container, root } = mountFullscreenSlider({
      count: 3,
      fs: {
        controls: {
          arrows: {
            enabled: true,
          },
        },
      },
    });
    await settle();

    const previousButton = document.body.querySelector<HTMLButtonElement>(
      "button[aria-label='Previous']"
    );
    const nextButton = document.body.querySelector<HTMLButtonElement>(
      "button[aria-label='Next']"
    );

    expect(container.contains(previousButton)).toBe(false);
    expect(container.contains(nextButton)).toBe(false);
    expect(previousButton?.style.position).toBe("fixed");
    expect(nextButton?.style.position).toBe("fixed");
    expect(previousButton?.style.getPropertyValue("--rmg-fs-slider-left")).toBe(
      "64px"
    );
    expect(previousButton?.style.getPropertyValue("--rmg-fs-slider-right")).toBe(
      "360px"
    );
    expect(previousButton?.style.getPropertyValue("--rmg-fs-slider-center-y")).toBe(
      "208px"
    );
    expect(previousButton?.style.left).toBe(
      "calc(var(--rmg-fs-slider-left, 0px) + 16px)"
    );
    expect(nextButton?.style.right).toBe(
      "calc(var(--rmg-fs-slider-right, 0px) + 16px)"
    );
    expect(previousButton?.style.top).toBe(
      "var(--rmg-fs-slider-center-y, 50%)"
    );
    expect(previousButton?.style.zIndex).toBe(
      String(FULLSCREEN_TOP_CHROME_Z_INDEX)
    );
    expect(nextButton?.style.zIndex).toBe(
      String(FULLSCREEN_TOP_CHROME_Z_INDEX)
    );
    expect(FULLSCREEN_TOP_CHROME_Z_INDEX).toBeGreaterThan(
      FULLSCREEN_CLOSE_BODY_LAYER_Z_INDEX
    );

    unmount(root, container);
  });

  test("hides portaled arrow chrome without resetting the measured frame", async () => {
    viewportLeft = 72;
    viewportTop = 34;

    const chromeStyles = {
      leftChevron: "leftChevron",
      rightChevron: "rightChevron",
      open: "open",
    };

    const { root, container, rerender } = mountFullscreenSlider({
      count: 3,
      chromeStyles,
      fs: {
        controls: {
          arrows: {
            enabled: true,
          },
        },
      },
    });
    await settle(3);
    await animationFrames(2);

    const previousButton = document.body.querySelector<HTMLButtonElement>(
      "button[aria-label='Previous']"
    );
    const nextButton = document.body.querySelector<HTMLButtonElement>(
      "button[aria-label='Next']"
    );

    expect(previousButton?.classList.contains(chromeStyles.open)).toBe(true);
    expect(nextButton?.classList.contains(chromeStyles.open)).toBe(true);
    expect(previousButton?.style.getPropertyValue("--rmg-fs-slider-left")).toBe(
      "72px"
    );
    expect(previousButton?.style.getPropertyValue("--rmg-fs-slider-right")).toBe(
      "352px"
    );
    expect(previousButton?.style.getPropertyValue("--rmg-fs-slider-center-y")).toBe(
      "214px"
    );

    rerender({ chromeHidden: true });
    await settle();

    const hiddenPreviousButton = document.body.querySelector<HTMLButtonElement>(
      "button[aria-label='Previous']"
    );
    const hiddenNextButton = document.body.querySelector<HTMLButtonElement>(
      "button[aria-label='Next']"
    );

    expect(hiddenPreviousButton?.classList.contains(chromeStyles.open)).toBe(false);
    expect(hiddenNextButton?.classList.contains(chromeStyles.open)).toBe(false);
    expect(hiddenPreviousButton?.style.getPropertyValue("--rmg-fs-slider-left")).toBe(
      "72px"
    );
    expect(hiddenPreviousButton?.style.getPropertyValue("--rmg-fs-slider-right")).toBe(
      "352px"
    );
    expect(hiddenPreviousButton?.style.getPropertyValue("--rmg-fs-slider-center-y")).toBe(
      "214px"
    );
    expect(hiddenPreviousButton?.style.zIndex).toBe(
      String(FULLSCREEN_TOP_CHROME_Z_INDEX)
    );
    expect(hiddenNextButton?.style.zIndex).toBe(
      String(FULLSCREEN_TOP_CHROME_Z_INDEX)
    );

    rerender({ show: false });
    await settle();

    const closedPreviousButton = document.body.querySelector<HTMLButtonElement>(
      "button[aria-label='Previous']"
    );

    expect(closedPreviousButton?.classList.contains(chromeStyles.open)).toBe(false);
    expect(closedPreviousButton?.style.getPropertyValue("--rmg-fs-slider-left")).toBe(
      "72px"
    );
    expect(closedPreviousButton?.style.getPropertyValue("--rmg-fs-slider-right")).toBe(
      "352px"
    );
    expect(closedPreviousButton?.style.getPropertyValue("--rmg-fs-slider-center-y")).toBe(
      "214px"
    );

    unmount(root, container);
  });

  test("clips the promoted close-drag viewport horizontally", async () => {
    const { container, root } = mountFullscreenSlider({ count: 3 });
    await settle();

    const viewport = container.querySelector<HTMLElement>(
      "[data-rmg-fs-viewport='true']"
    );
    const activeSlide = container.querySelector<HTMLElement>(
      "[data-rmg-fs-slide='true'][data-rmg-canonical-idx='0'][data-rmg-clone='false']"
    );

    expect(viewport).not.toBeNull();
    expect(activeSlide).not.toBeNull();

    await React.act(async () => {
      activeSlide!.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          button: 0,
          cancelable: true,
          clientX: 300,
          clientY: 180,
        })
      );
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          cancelable: true,
          clientX: 300,
          clientY: 250,
        })
      );
      await Promise.resolve();
    });

    expect(viewport?.getAttribute("data-rmg-fs-close-layer-active")).toBe(
      "true"
    );
    expect(viewport?.style.overflow).toBe("visible");
    expect(viewport?.style.clipPath).toContain("-200vmax");

    unmount(root, container);
  });

  test("renders a bounded virtual window for large fullscreen tracks", async () => {
    const { container, root } = mountFullscreenSlider({
      count: 30,
      virtualization: { enabled: true, overscan: 2, threshold: 5 },
    });
    await settle();

    const slides = Array.from(
      container.querySelectorAll<HTMLElement>("[data-rmg-fs-slide='true']")
    );
    const leadingClone = slides.find(
      (slide) =>
        slide.getAttribute("data-rmg-canonical-idx") === "28" &&
        slide.getAttribute("data-rmg-clone") === "true"
    );

    expect(slides.length).toBeGreaterThan(0);
    expect(slides.length).toBeLessThan(30);
    expect(leadingClone).toBeDefined();

    unmount(root, container);
  });

  test("requestSet keeps logical indexes without mounting every slide", async () => {
    const { container, root, sub } = mountFullscreenSlider({
      count: 30,
      virtualization: { enabled: true, overscan: 2, threshold: 5 },
    });
    await settle();

    React.act(() => {
      sub.requestSet(12, "instant");
    });
    await settle();

    const slides = Array.from(
      container.querySelectorAll<HTMLElement>("[data-rmg-fs-slide='true']")
    );
    const activeSlide = slides.find(
      (slide) =>
        slide.getAttribute("data-rmg-canonical-idx") === "12" &&
        slide.getAttribute("data-rmg-clone") === "false"
    );

    expect(sub.get()).toBe(12);
    expect(slides.length).toBeLessThan(30);
    expect(activeSlide).toBeDefined();

    unmount(root, container);
  });

  test("falls back to the full wrapped track below the threshold", async () => {
    const { container, root } = mountFullscreenSlider({
      count: 8,
      virtualization: { enabled: true, overscan: 2, threshold: 20 },
    });
    await settle();

    expect(
      container.querySelectorAll("[data-rmg-fs-slide='true']")
    ).toHaveLength(10);

    unmount(root, container);
  });
});
