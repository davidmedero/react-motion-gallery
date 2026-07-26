// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import {
  FullscreenModal,
  isElementVisiblyOnScreen,
  isLikelyFullscreenCloseScrollMobile,
  resolveCenteredScrollTop,
  resolveCloseShieldReleaseMs,
  resolveFullscreenCloseScrollPolicy,
  shouldUseFadeClose,
} from "./FullscreenModal";
import {
  FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX,
  FULLSCREEN_TOP_CHROME_Z_INDEX,
} from "./layering";

function rect(
  left: number,
  top: number,
  width: number,
  height: number
): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

function mount(node: React.ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  React.act(() => {
    root.render(node);
  });

  return { container, root };
}

function unmount(root: Root, container: HTMLElement) {
  React.act(() => {
    root.unmount();
  });
  container.remove();
}

async function flushAnimationFrame() {
  await React.act(async () => {
    vi.advanceTimersByTime(16);
    await Promise.resolve();
  });
}

async function flushTransitionWarm() {
  await React.act(async () => {
    vi.advanceTimersByTime(50);
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (Object.prototype.hasOwnProperty.call(document, "elementsFromPoint")) {
    delete (document as any).elementsFromPoint;
  }
  document.body.innerHTML = "";
});

afterAll(() => {
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

describe("shouldUseFadeClose", () => {
  test("keeps a fade-opened item on the fade close path even when a transform target is available", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "fade",
        isLatchedIntroIndex: true,
        hasTransformTarget: true,
      })
    ).toBe(true);
  });

  test("uses the transform close path for a fade-opened image after navigating to a different transform target", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "fade",
        isLatchedIntroIndex: false,
        hasTransformTarget: true,
      })
    ).toBe(false);
  });

  test("allows a staged dialog zoom-out close to use transform after a latched fade intro", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "fade",
        isLatchedIntroIndex: true,
        hasTransformTarget: true,
        ignoreLatchedFadeIntro: true,
      })
    ).toBe(false);
  });

  test("keeps fade-opened images on the fade close path when there is no transform target", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "fade",
        isLatchedIntroIndex: false,
        hasTransformTarget: false,
      })
    ).toBe(true);
  });

  test("keeps scale-opened images on the scale close path", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "scale",
        isLatchedIntroIndex: true,
        hasTransformTarget: true,
      })
    ).toBe(false);
  });

  test("uses fade close when a transform target is unavailable", () => {
    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: false,
        introMethod: "scale",
        isLatchedIntroIndex: true,
        hasTransformTarget: false,
      })
    ).toBe(true);
  });

  test("uses fade close for introFade and video slides", () => {
    expect(
      shouldUseFadeClose({
        introFade: true,
        isVideoSlide: false,
        introMethod: "scale",
        isLatchedIntroIndex: false,
        hasTransformTarget: true,
      })
    ).toBe(true);

    expect(
      shouldUseFadeClose({
        introFade: false,
        isVideoSlide: true,
        introMethod: "scale",
        isLatchedIntroIndex: false,
        hasTransformTarget: true,
      })
    ).toBe(true);
  });
});

describe("resolveCloseShieldReleaseMs", () => {
  test("uses a short click-swallow window instead of the full fade duration", () => {
    expect(resolveCloseShieldReleaseMs(300)).toBe(80);
    expect(resolveCloseShieldReleaseMs(560)).toBe(80);
  });

  test("does not extend shorter or disabled close durations", () => {
    expect(resolveCloseShieldReleaseMs(40)).toBe(40);
    expect(resolveCloseShieldReleaseMs(0)).toBe(0);
  });
});

describe("resolveCenteredScrollTop", () => {
  test("centers a target in the visual viewport", () => {
    expect(
      resolveCenteredScrollTop({
        rectTop: 900,
        rectHeight: 200,
        scrollY: 1200,
        viewportHeight: 800,
        viewportOffsetTop: 0,
        maxScrollY: 5000,
      })
    ).toBe(1800);
  });

  test("subtracts visual viewport offset before centering on mobile", () => {
    expect(
      resolveCenteredScrollTop({
        rectTop: 900,
        rectHeight: 200,
        scrollY: 1200,
        viewportHeight: 700,
        viewportOffsetTop: 80,
        maxScrollY: 5000,
      })
    ).toBe(1770);
  });

  test("clamps bottom-of-page targets to the maximum scroll position", () => {
    expect(
      resolveCenteredScrollTop({
        rectTop: 4155.796875,
        rectHeight: 316.75,
        scrollY: 0,
        viewportHeight: 1100,
        maxScrollY: 3339,
      })
    ).toBe(3339);
  });
});

describe("isElementVisiblyOnScreen", () => {
  function setupTargetAndOccluder() {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });

    const target = document.createElement("img");
    target.setAttribute("data-rmg-test", "target");
    document.body.appendChild(target);

    const occluder = document.createElement("nav");
    occluder.setAttribute("data-rmg-test", "occluder");
    document.body.appendChild(occluder);

    const ignored = document.createElement("div");
    ignored.setAttribute("data-rmg-fs-shield", "true");
    document.body.appendChild(ignored);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const testId = this.getAttribute("data-rmg-test");
      if (testId === "target") return rect(24, 80, 180, 200);
      if (testId === "occluder") return rect(0, 0, 390, 320);
      return rect(0, 0, 390, 700);
    });

    return { ignored, occluder, target };
  }

  test("treats an on-screen element as hidden when another element covers every sampled point", () => {
    const { ignored, occluder, target } = setupTargetAndOccluder();

    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn(() => [ignored, occluder, target, document.body]),
    });

    expect(
      isElementVisiblyOnScreen(target, 0.05, { ignoredElements: [ignored] })
    ).toBe(false);
  });

  test("ignores fullscreen close layers when checking the base element", () => {
    const { ignored, target } = setupTargetAndOccluder();

    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn(() => [ignored, target, document.body]),
    });

    expect(
      isElementVisiblyOnScreen(target, 0.05, { ignoredElements: [ignored] })
    ).toBe(true);
  });
});

describe("fullscreen close scroll policy", () => {
  const mobileContext = {
    viewportWidth: 390,
    viewportHeight: 700,
    visualViewportWidth: 390,
    visualViewportHeight: 700,
    coarsePointer: true,
    hoverNone: true,
    maxTouchPoints: 5,
    userAgent: "test",
  };

  test("detects phone-like mobile viewports without relying on user agent only", () => {
    expect(isLikelyFullscreenCloseScrollMobile(mobileContext)).toBe(true);
    expect(
      isLikelyFullscreenCloseScrollMobile({
        ...mobileContext,
        viewportWidth: 844,
        viewportHeight: 390,
        visualViewportWidth: 844,
        visualViewportHeight: 390,
      })
    ).toBe(true);
    expect(
      isLikelyFullscreenCloseScrollMobile({
        ...mobileContext,
        viewportWidth: 1280,
        viewportHeight: 900,
        visualViewportWidth: 1280,
        visualViewportHeight: 900,
      })
    ).toBe(false);
  });

  test("defaults to disabled and supports desktop-only mobile gating", () => {
    expect(
      resolveFullscreenCloseScrollPolicy({
        closeScroll: false,
        index: 0,
        layout: "grid",
        target: null,
        mobileContext,
      }).enabled
    ).toBe(false);

    expect(
      resolveFullscreenCloseScrollPolicy({
        closeScroll: true,
        index: 0,
        layout: "grid",
        target: null,
        mobileContext,
      })
    ).toMatchObject({ enabled: true, timing: "before-close", isMobile: true });

    expect(
      resolveFullscreenCloseScrollPolicy({
        closeScroll: { enabled: "desktop-only" },
        index: 0,
        layout: "grid",
        target: null,
        mobileContext,
      }).enabled
    ).toBe(false);
  });

  test("allows custom mobile detection to override the built-in heuristic", () => {
    expect(
      resolveFullscreenCloseScrollPolicy({
        closeScroll: {
          enabled: "desktop-only",
          mobileDetection: () => false,
        },
        index: 0,
        layout: "grid",
        target: null,
        mobileContext,
      })
    ).toMatchObject({ enabled: true, isMobile: false });
  });
});

describe("fullscreen close sequencing", () => {
  function setupGridCloseScenario(
    closeScroll?: any,
    introDuration?: any,
    introEasing: any = "linear",
    options: {
      destDocumentTop?: number;
      layout?: "grid" | "slider";
      coverDestWithNav?: boolean;
      omitFullscreenImage?: boolean;
      showCounter?: boolean;
    } = {}
  ) {
    vi.useFakeTimers();

    const events: string[] = [];
    let scrollY = 0;
    let rafNow = 0;
    const destDocumentTop = options.destDocumentTop ?? 900;
    const layout = options.layout ?? "grid";
    const navCoverBottom = 320;

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      get: () => scrollY,
    });
    Object.defineProperty(document.documentElement, "scrollTop", {
      configurable: true,
      get: () => scrollY,
      set: (value) => {
        scrollY = Number(value) || 0;
      },
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 2200,
    });
    Object.defineProperty(document.body, "scrollHeight", {
      configurable: true,
      value: 2200,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    vi.spyOn(window, "scrollTo").mockImplementation((_left, top) => {
      events.push("scrollTo");
      scrollY = Number(top) || 0;
    });

    const destHost = document.createElement("div");
    destHost.setAttribute("data-rmg-test", "dest-host");
    destHost.setAttribute("data-rmg-idx", "0");

    const destImg = document.createElement("img");
    destImg.setAttribute("data-rmg-test", "dest-img");
    destImg.src = "/thumbnail.jpg";
    destImg.style.objectFit = "cover";
    destImg.style.objectPosition = "50% 50%";
    destHost.appendChild(destImg);

    let sliderTrack: HTMLDivElement | null = null;
    if (layout === "slider") {
      const sliderViewport = document.createElement("div");
      sliderTrack = document.createElement("div");
      destHost.setAttribute("data-rmg-slide", "true");
      sliderTrack.appendChild(destHost);
      sliderViewport.appendChild(sliderTrack);
      document.body.appendChild(sliderViewport);
    } else {
      document.body.appendChild(destHost);
    }

    const coveringNav = document.createElement("nav");
    coveringNav.setAttribute("data-rmg-test", "covering-nav");
    if (options.coverDestWithNav) {
      document.body.appendChild(coveringNav);
    }

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const testId = this.getAttribute("data-rmg-test");
      if (testId === "dest-host") return rect(24, destDocumentTop - scrollY, 180, 200);
      if (testId === "dest-img") return rect(24, destDocumentTop - scrollY, 180, 200);
      if (testId === "covering-nav") return rect(0, 0, 390, navCoverBottom);
      if (testId === "fs-img") return rect(40, 80, 300, 420);
      if (this.classList.contains("fs_modal")) return rect(0, 0, 390, 700);
      return rect(0, 0, 390, 700);
    });

    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn((x: number, y: number) => {
        const stack: Element[] = [];
        const shield = document.querySelector("[data-rmg-fs-shield='true']");
        if (shield) stack.push(shield);
        const destTop = destDocumentTop - scrollY;
        const destBottom = destTop + 200;
        const pointHitsDest = x >= 24 && x <= 204 && y >= destTop && y <= destBottom;
        const pointHitsCoveringNav =
          options.coverDestWithNav && x >= 0 && x <= 390 && y >= 0 && y <= navCoverBottom;

        if (pointHitsCoveringNav) stack.push(coveringNav);
        if (pointHitsDest) stack.push(destImg, destHost);
        stack.push(document.body, document.documentElement);
        return stack;
      }),
    });

    const setClosingModal = vi.fn((value: boolean) => {
      events.push(`closing:${value}`);
    });

    const overlayDivRef = { current: null };
    const closeButtonRef = React.createRef<HTMLElement>();
    const counterRef = React.createRef<HTMLElement>();
    const leftChevronRef = React.createRef<HTMLElement>();
    const rightChevronRef = React.createRef<HTMLElement>();
    const requestFsCloseRef = { current: null };
    const cancelFsCloseRef = { current: null };

    const child = React.createElement(
      "div",
      { className: "fullscreen_slider" },
      React.createElement(
        "div",
        {
          "data-rmg-fs-slide": "true",
          "data-index": "0",
          "data-rmg-canonical-idx": "0",
        },
        React.createElement(
          "div",
          { "data-rmg-fs-media": "true" },
          options.omitFullscreenImage
            ? React.createElement("span", { "data-rmg-test": "fs-placeholder" })
            : React.createElement("img", {
                "data-rmg-test": "fs-img",
                src: "/fullscreen.jpg",
                style: {
                  objectFit: "contain",
                  objectPosition: "50% 50%",
                },
              })
        )
      )
    );

    const { container, root } = mount(
      React.createElement(
        FullscreenModal,
        {
          fsSub: { get: () => 0 },
          open: true,
          onClose: vi.fn(),
          isClick: { current: true },
          isAnimating: { current: false },
          overlayDivRef,
          closeButtonRef,
          counterRef,
          leftChevronRef,
          rightChevronRef,
          cells: { current: [] },
          setShowFullscreenSlider: vi.fn(),
          cellCount: options.showCounter ? 2 : 1,
          setClosingModal,
          slides: {
            current:
              layout === "slider"
                ? [{ cells: [{ element: destHost, index: 0 }], target: 0 }]
                : [],
          },
          slider: { current: sliderTrack },
          wrappedItems: [{ src: "/a.jpg" }, { src: "/b.jpg" }, { src: "/c.jpg" }],
          setSliderIndex: vi.fn(),
          onForceResetZoom: vi.fn(),
          layout,
          expandableImageRefs: { current: [{ current: destImg }] },
          resolveLayoutlessTarget: () => ({
            host: destHost,
            image: destImg,
            media: destHost,
          }),
          introFade: false,
          introDuration,
          introEasing,
          requestFsCloseRef,
          cancelFsCloseRef,
          fs: {
            closeScroll,
            controls: {
              close: {
                render: () => React.createElement("span", null, "close"),
              },
              counter: { enabled: options.showCounter === true },
            },
            effects: {},
          },
          styles: { open: "open", closeBtn: "closeBtn", counter: "counter" },
          syncFullscreenSourceFromIndex: vi.fn(),
          introMethod: "scale",
          setLatchedIntroMethod: vi.fn(),
          latchedIntroIndex: 0,
        } as any,
        child
      )
    );

    const closeButton = closeButtonRef.current as HTMLButtonElement | null;
    expect(closeButton).not.toBeNull();

    return {
      cancelFsCloseRef,
      closeButton,
      counter: counterRef.current,
      container,
      events,
      root,
    };
  }

  async function clickClose(closeButton: HTMLButtonElement | null) {
    await React.act(async () => {
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });
  }

  test("portals the standard close button and counter into the body-level top chrome layer", () => {
    const {
      closeButton,
      counter,
      container,
      root,
    } = setupGridCloseScenario(undefined, undefined, "linear", {
      showCounter: true,
    });
    const modal = container.querySelector("[data-rmg-fs-root='true']");

    expect(closeButton?.style.zIndex).toBe(
      String(FULLSCREEN_TOP_CHROME_Z_INDEX)
    );
    expect(counter?.style.zIndex).toBe(
      String(FULLSCREEN_TOP_CHROME_Z_INDEX)
    );
    expect(closeButton?.parentElement).toBe(document.body);
    expect(counter?.parentElement).toBe(document.body);
    expect(modal?.contains(closeButton ?? null)).toBe(false);
    expect(modal?.contains(counter ?? null)).toBe(false);

    unmount(root, container);
    expect(closeButton?.isConnected).toBe(false);
    expect(counter?.isConnected).toBe(false);
  });

  test("does not page-scroll by default during grid close", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario();

    await clickClose(closeButton);

    expect(events).toEqual(["closing:true"]);

    await flushAnimationFrame();

    await React.act(async () => {
      vi.advanceTimersByTime(540);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true", "closing:false"]);

    unmount(root, container);
  });

  test("only waits for the proxy warm-up when no page scroll is needed", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario(
      true,
      undefined,
      "linear",
      { destDocumentTop: 250 }
    );

    await clickClose(closeButton);

    expect(events).toEqual([]);
    expect(
      container.querySelector('[data-rmg-fs-close-proxy="true"]')
    ).not.toBeNull();
    await flushTransitionWarm();
    expect(events).toEqual(["closing:true"]);

    await flushAnimationFrame();

    await React.act(async () => {
      vi.advanceTimersByTime(540);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true", "closing:false"]);

    unmount(root, container);
  });

  test("starts a visible slider close after its proxy is warm", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario(
      undefined,
      undefined,
      "linear",
      { destDocumentTop: 250, layout: "slider" }
    );

    await clickClose(closeButton);

    expect(events).toEqual([]);
    await flushTransitionWarm();
    expect(events).toEqual(["closing:true"]);

    await flushAnimationFrame();

    await React.act(async () => {
      vi.advanceTimersByTime(540);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true", "closing:false"]);

    unmount(root, container);
  });

  test("waits for an entries slider target to mount before transform close", async () => {
    vi.useFakeTimers();

    const events: string[] = [];
    let rafNow = 0;

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(1200);
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(1600);

    const section = document.createElement("section");
    section.setAttribute("data-rmg-entry-owner", "0");
    section.setAttribute("data-rmg-entry-mounted", "1");
    section.setAttribute("data-rmg-entry-ready", "1");
    document.body.appendChild(section);

    const sliderViewport = document.createElement("div");
    const sliderTrack = document.createElement("div");
    sliderViewport.appendChild(sliderTrack);
    document.body.appendChild(sliderViewport);

    const destHost = document.createElement("div");
    destHost.setAttribute("data-rmg-test", "dest-host");
    destHost.setAttribute("data-rmg-slide", "true");
    destHost.setAttribute("data-rmg-idx", "2");

    const destImg = document.createElement("img");
    destImg.setAttribute("data-rmg-test", "dest-img");
    destImg.src = "/target.jpg";
    destImg.style.objectFit = "cover";
    destImg.style.objectPosition = "50% 50%";
    destHost.appendChild(destImg);

    const slideCells = [
      { element: document.createElement("div"), index: 0 },
      { element: document.createElement("div"), index: 1 },
      { element: destHost, index: 2 },
    ];

    const setSliderIndex = vi.fn((index: number, mode: string) => {
      events.push(`setIndex:${index}:${mode}`);
      window.requestAnimationFrame(() => {
        sliderTrack.appendChild(destHost);
      });
    });

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const testId = this.getAttribute("data-rmg-test");
      if (testId === "dest-host") return rect(24, 120, 180, 200);
      if (testId === "dest-img") return rect(24, 120, 180, 200);
      if (testId === "fs-img") return rect(40, 80, 300, 420);
      if (this.classList.contains("fs_modal")) return rect(0, 0, 390, 700);
      return rect(0, 0, 390, 700);
    });

    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn((x: number, y: number) => {
        const stack: Element[] = [];
        const shield = document.querySelector("[data-rmg-fs-shield='true']");
        if (shield) stack.push(shield);

        const pointHitsDest =
          destHost.isConnected &&
          x >= 24 &&
          x <= 204 &&
          y >= 120 &&
          y <= 320;

        if (pointHitsDest) stack.push(destImg, destHost);
        stack.push(document.body, document.documentElement);
        return stack;
      }),
    });

    const setClosingModal = vi.fn((value: boolean) => {
      events.push(`closing:${value}`);
    });
    const closeButtonRef = React.createRef<HTMLElement>();
    const counterRef = React.createRef<HTMLElement>();
    const leftChevronRef = React.createRef<HTMLElement>();
    const rightChevronRef = React.createRef<HTMLElement>();
    const requestFsCloseRef = { current: null };
    const cancelFsCloseRef = { current: null };

    const child = React.createElement(
      "div",
      { className: "fullscreen_slider" },
      React.createElement(
        "div",
        {
          "data-rmg-fs-slide": "true",
          "data-index": "2",
          "data-rmg-canonical-idx": "2",
        },
        React.createElement(
          "div",
          { "data-rmg-fs-media": "true" },
          React.createElement("img", {
            "data-rmg-test": "fs-img",
            src: "/fullscreen.jpg",
            style: {
              objectFit: "contain",
              objectPosition: "50% 50%",
            },
          })
        )
      )
    );

    const { container, root } = mount(
      React.createElement(
        FullscreenModal,
        {
          fsSub: { get: () => 2 },
          open: true,
          onClose: vi.fn(),
          isClick: { current: true },
          isAnimating: { current: false },
          overlayDivRef: { current: null },
          closeButtonRef,
          counterRef,
          leftChevronRef,
          rightChevronRef,
          cells: { current: [] },
          setShowFullscreenSlider: vi.fn(),
          cellCount: 3,
          setClosingModal,
          slides: {
            current: slideCells.map((cell, target) => ({
              cells: [cell],
              target,
            })),
          },
          slider: { current: sliderTrack },
          wrappedItems: [
            { src: "/clone-prev.jpg" },
            { src: "/a.jpg" },
            { src: "/b.jpg" },
            { src: "/c.jpg" },
            { src: "/clone-next.jpg" },
          ],
          setSliderIndex,
          onForceResetZoom: vi.fn(),
          layout: "entries",
          entryMapRef: {
            current: [
              { entryIndex: 0, mediaIndex: 0 },
              { entryIndex: 0, mediaIndex: 1 },
              { entryIndex: 0, mediaIndex: 2 },
            ],
          },
          entryMediaLayout: "slider",
          expandableImageRefs: { current: [] },
          resolveLayoutlessTarget: () => ({
            host: null,
            image: null,
            media: null,
          }),
          introFade: false,
          introDuration: { transform: 500, fade: 180 },
          introEasing: "linear",
          requestFsCloseRef,
          cancelFsCloseRef,
          fs: {
            closeScroll: false,
            controls: {
              close: {
                render: () => React.createElement("span", null, "close"),
              },
              counter: { enabled: false },
            },
            effects: {},
          },
          styles: { open: "open", closeBtn: "closeBtn", spinner: "spinner" },
          syncFullscreenSourceFromIndex: vi.fn(),
          introMethod: "scale",
          setLatchedIntroMethod: vi.fn(),
          latchedIntroIndex: 2,
        } as any,
        child
      )
    );

    const closeButton = closeButtonRef.current as HTMLButtonElement | null;

    await clickClose(closeButton);

    expect(destHost.isConnected).toBe(false);
    expect(events).toEqual([]);

    await flushAnimationFrame();

    expect(events).toEqual(["setIndex:2:instant"]);
    expect(destHost.isConnected).toBe(false);

    await flushAnimationFrame();

    expect(destHost.isConnected).toBe(true);
    expect(events).toEqual(["setIndex:2:instant"]);

    await flushAnimationFrame();

    await flushTransitionWarm();
    expect(events).toContain("closing:true");

    await flushAnimationFrame();

    expect(container.querySelector("[data-rmg-fs-close-clipper='true']")).not.toBeNull();

    await React.act(async () => {
      vi.advanceTimersByTime(580);
      await Promise.resolve();
    });

    expect(events).toContain("closing:false");

    unmount(root, container);
  });

  test("scopes entries close scroll to the active virtualized entries root before fade fallback", async () => {
    vi.useFakeTimers();

    const events: string[] = [];
    let scrollY = 0;
    let rafNow = 0;

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      get: () => scrollY,
    });
    Object.defineProperty(document.documentElement, "scrollTop", {
      configurable: true,
      get: () => scrollY,
      set: (value) => {
        scrollY = Number(value) || 0;
      },
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    vi.spyOn(window, "scrollTo").mockImplementation((options?: any, top?: any) => {
      events.push("scrollTo");
      scrollY =
        typeof options === "object"
          ? Number(options.top) || 0
          : Number(top) || 0;
    });

    const unrelatedRoot = document.createElement("div");
    const unrelatedOwner = document.createElement("section");
    unrelatedOwner.setAttribute("data-rmg-test", "unrelated-owner");
    unrelatedOwner.setAttribute("data-rmg-entry-owner", "4");
    unrelatedOwner.setAttribute("data-rmg-entry-mounted", "1");
    unrelatedOwner.setAttribute("data-rmg-entry-ready", "1");
    unrelatedRoot.appendChild(unrelatedOwner);
    document.body.appendChild(unrelatedRoot);

    const entryRoot = document.createElement("div");
    entryRoot.setAttribute("data-rmg-entries-layout", "list");
    const renderedOwner = document.createElement("section");
    renderedOwner.setAttribute("data-rmg-test", "active-rendered-owner");
    renderedOwner.setAttribute("data-rmg-entry-owner", "0");
    renderedOwner.setAttribute("data-rmg-entry-virtual-index", "0");
    renderedOwner.setAttribute("data-rmg-entry-virtual-row", "0");
    renderedOwner.setAttribute("data-rmg-entry-mounted", "1");
    renderedOwner.setAttribute("data-rmg-entry-ready", "1");
    entryRoot.appendChild(renderedOwner);
    document.body.appendChild(entryRoot);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const testId = this.getAttribute("data-rmg-test");
      if (testId === "unrelated-owner") return rect(16, 40, 300, 180);
      if (testId === "active-rendered-owner") return rect(24, 120 - scrollY, 300, 200);
      if (this.classList.contains("fs_modal")) return rect(0, 0, 390, 700);
      return rect(0, 0, 390, 700);
    });

    const setClosingModal = vi.fn((value: boolean) => {
      events.push(`closing:${value}`);
    });
    const closeButtonRef = React.createRef<HTMLElement>();
    const counterRef = React.createRef<HTMLElement>();
    const leftChevronRef = React.createRef<HTMLElement>();
    const rightChevronRef = React.createRef<HTMLElement>();
    const requestFsCloseRef = { current: null };
    const cancelFsCloseRef = { current: null };

    const { container, root } = mount(
      React.createElement(
        FullscreenModal,
        {
          fsSub: { get: () => 4 },
          open: true,
          onClose: vi.fn(),
          isClick: { current: true },
          isAnimating: { current: false },
          overlayDivRef: { current: null },
          closeButtonRef,
          counterRef,
          leftChevronRef,
          rightChevronRef,
          cells: { current: [] },
          setShowFullscreenSlider: vi.fn(),
          cellCount: 5,
          setClosingModal,
          slides: { current: [] },
          slider: { current: null },
          wrappedItems: [
            { src: "/clone-prev.jpg" },
            { src: "/0.jpg" },
            { src: "/1.jpg" },
            { src: "/2.jpg" },
            { src: "/3.jpg" },
            { src: "/4.jpg" },
            { src: "/clone-next.jpg" },
          ],
          setSliderIndex: vi.fn(),
          onForceResetZoom: vi.fn(),
          layout: "entries",
          entryMapRef: {
            current: [
              { entryIndex: 0, mediaIndex: 0 },
              { entryIndex: 1, mediaIndex: 0 },
              { entryIndex: 2, mediaIndex: 0 },
              { entryIndex: 3, mediaIndex: 0 },
              { entryIndex: 4, mediaIndex: 0 },
            ],
          },
          entryRootRef: { current: entryRoot },
          entryMediaLayout: "slider",
          expandableImageRefs: { current: [] },
          resolveLayoutlessTarget: () => ({
            host: null,
            image: null,
            media: null,
          }),
          introFade: false,
          introDuration: { transform: 500, fade: 180 },
          introEasing: "linear",
          requestFsCloseRef,
          cancelFsCloseRef,
          fs: {
            closeScroll: true,
            controls: {
              close: {
                render: () => React.createElement("span", null, "close"),
              },
              counter: { enabled: false },
            },
            effects: {},
          },
          styles: { open: "open", closeBtn: "closeBtn", spinner: "spinner" },
          syncFullscreenSourceFromIndex: vi.fn(),
          introMethod: "scale",
          setLatchedIntroMethod: vi.fn(),
          latchedIntroIndex: 4,
        } as any,
        React.createElement("div", { className: "fullscreen_slider" })
      )
    );

    const closeButton = closeButtonRef.current as HTMLButtonElement | null;

    await clickClose(closeButton);

    expect(events).toEqual(["scrollTo"]);
    expect(scrollY).toBeGreaterThan(0);

    await React.act(async () => {
      vi.advanceTimersByTime(1220);
      await Promise.resolve();
    });

    expect(events).toEqual(["scrollTo", "closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(220);
      await Promise.resolve();
    });

    expect(events).toEqual(["scrollTo", "closing:true", "closing:false"]);

    unmount(root, container);
  });

  test("keeps the transform close image inside the modal stacking context", async () => {
    const { closeButton, container, root } = setupGridCloseScenario(
      undefined,
      undefined,
      "linear",
      { destDocumentTop: 250 }
    );

    await clickClose(closeButton);

    await flushAnimationFrame();

    const modal = container.querySelector(".fs_modal");
    const closeClipper = container.querySelector<HTMLElement>(
      "[data-rmg-fs-close-clipper='true']"
    );

    expect(modal).not.toBeNull();
    expect(closeClipper).not.toBeNull();
    expect(closeClipper?.parentElement).toBe(modal);
    expect(closeClipper?.style.zIndex).toBe(
      String(FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX)
    );

    unmount(root, container);
  });

  test("keeps transform close above the former device-pixel cutoff with a capped proxy", async () => {
    vi.stubGlobal("devicePixelRatio", 10);
    vi.spyOn(
      HTMLImageElement.prototype,
      "naturalWidth",
      "get"
    ).mockReturnValue(2400);
    vi.spyOn(
      HTMLImageElement.prototype,
      "naturalHeight",
      "get"
    ).mockReturnValue(1500);

    const { closeButton, container, root } = setupGridCloseScenario(
      undefined,
      undefined,
      "linear",
      { destDocumentTop: 250 }
    );
    const liveImage = container.querySelector<HTMLImageElement>(
      '[data-rmg-test="fs-img"]'
    );
    const liveParent = liveImage?.parentElement;

    await clickClose(closeButton);
    await flushAnimationFrame();

    const proxy = container.querySelector<HTMLImageElement>(
      '[data-rmg-fs-close-proxy="true"]'
    );
    const cropper = container.querySelector<HTMLElement>(
      '[data-rmg-fs-close-clipper="true"]'
    );

    expect(proxy).not.toBeNull();
    expect(proxy).not.toBe(liveImage);
    expect(Math.max(
      Number.parseFloat(proxy?.style.width || "0"),
      Number.parseFloat(proxy?.style.height || "0")
    )).toBeLessThanOrEqual(1024);
    expect(liveImage?.parentElement).toBe(liveParent);
    expect(liveImage?.style.position).toBe("");
    expect(liveImage?.style.width).toBe("");
    expect(cropper?.style.clipPath).toBe("");
    expect(cropper?.querySelector('[style*="clip-path"]')).toBeNull();

    unmount(root, container);
    expect(
      document.querySelector('[data-rmg-fs-close-proxy="true"]')
    ).toBeNull();
  });

  test("does not swap to a lower-resolution same-aspect thumbnail during close", async () => {
    vi.spyOn(
      HTMLImageElement.prototype,
      "naturalWidth",
      "get"
    ).mockReturnValue(2400);
    vi.spyOn(
      HTMLImageElement.prototype,
      "naturalHeight",
      "get"
    ).mockReturnValue(1500);

    const { closeButton, container, root } = setupGridCloseScenario(
      undefined,
      undefined,
      "linear",
      { destDocumentTop: 250 }
    );
    const destinationImage = document.querySelector<HTMLImageElement>(
      '[data-rmg-test="dest-img"]'
    );
    expect(destinationImage).not.toBeNull();
    Object.defineProperty(destinationImage!, "naturalWidth", {
      configurable: true,
      value: 240,
    });
    Object.defineProperty(destinationImage!, "naturalHeight", {
      configurable: true,
      value: 150,
    });

    await clickClose(closeButton);

    const proxy = container.querySelector<HTMLImageElement>(
      '[data-rmg-fs-close-proxy="true"]'
    );
    expect(proxy?.src).toContain("/fullscreen.jpg");
    expect(proxy?.src).not.toContain("/thumbnail.jpg");

    unmount(root, container);
  });

  test("uses fade timing when the slider thumbnail is offscreen", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario(
      undefined,
      { transform: 500, fade: 180 },
      "linear",
      { destDocumentTop: 900, layout: "slider" }
    );

    await clickClose(closeButton);

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(219);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true", "closing:false"]);

    unmount(root, container);
  });

  test("falls back to fade close when the active fullscreen image is transiently unavailable", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario(
      undefined,
      { transform: 500, fade: 180 },
      "linear",
      { destDocumentTop: 250, layout: "slider", omitFullscreenImage: true }
    );

    await clickClose(closeButton);

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(219);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true", "closing:false"]);

    unmount(root, container);
  });

  test("uses fade timing for the invisible-thumb close fallback", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario(
      undefined,
      { transform: 500, fade: 180 }
    );

    await clickClose(closeButton);

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(219);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true", "closing:false"]);

    unmount(root, container);
  });

  test("uses fade timing when the visible thumbnail is fully covered", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario(
      undefined,
      { transform: 500, fade: 180 },
      "linear",
      { destDocumentTop: 80, coverDestWithNav: true }
    );

    await clickClose(closeButton);

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(219);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true", "closing:false"]);

    unmount(root, container);
  });

  test("centers a grid thumb before starting the visible close animation when enabled", async () => {
    const { cancelFsCloseRef, closeButton, container, events, root } =
      setupGridCloseScenario(true);

    await clickClose(closeButton);

    expect(events).toEqual(["scrollTo"]);
    expect(cancelFsCloseRef.current).toEqual(expect.any(Function));

    await flushAnimationFrame();
    expect(events).toEqual(["scrollTo"]);

    await flushAnimationFrame();
    expect(events).toEqual(["scrollTo"]);

    await flushAnimationFrame();
    await flushTransitionWarm();
    expect(events.slice(0, 2)).toEqual(["scrollTo", "closing:true"]);

    await flushAnimationFrame();
    await React.act(async () => {
      vi.advanceTimersByTime(380);
      await Promise.resolve();
    });

    expect(events).toContain("closing:false");

    unmount(root, container);
  });

  test("uses transform timing for the visible close-to-thumb path", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario(
      true,
      { transform: 500, fade: 180 }
    );

    await clickClose(closeButton);

    expect(events).toEqual(["scrollTo"]);

    await flushAnimationFrame();
    await flushAnimationFrame();
    await flushAnimationFrame();
    await flushTransitionWarm();

    expect(events.slice(0, 2)).toEqual(["scrollTo", "closing:true"]);

    await flushAnimationFrame();

    await React.act(async () => {
      vi.advanceTimersByTime(579);
      await Promise.resolve();
    });

    expect(events).not.toContain("closing:false");

    await React.act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(events).toContain("closing:false");

    unmount(root, container);
  });

  test("can defer grid page scroll until after close teardown", async () => {
    const { closeButton, container, events, root } = setupGridCloseScenario({
      enabled: true,
      timing: "after-close",
    });

    await clickClose(closeButton);

    expect(events).toEqual(["closing:true"]);

    await React.act(async () => {
      vi.advanceTimersByTime(540);
      await Promise.resolve();
    });

    expect(events).toEqual(["closing:true", "closing:false"]);

    await flushAnimationFrame();

    expect(events).toEqual(["closing:true", "closing:false", "scrollTo"]);

    unmount(root, container);
  });

  test("restores forced entry source styles after entries close", async () => {
    vi.useFakeTimers();

    let rafNow = 0;
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    const section = document.createElement("section");
    section.setAttribute("data-rmg-entry-owner", "0");
    section.setAttribute("data-rmg-entry-mounted", "1");
    section.setAttribute("data-rmg-entry-ready", "1");
    section.style.setProperty("--rmg-entry-reveal-duration", "320ms");

    const skeleton = document.createElement("div");
    skeleton.setAttribute("data-rmg-entry-skeleton", "");
    skeleton.style.opacity = "0.25";

    const content = document.createElement("div");
    content.style.transition = "opacity 120ms linear";

    section.append(skeleton, content);
    document.body.appendChild(section);

    const closeButtonRef = React.createRef<HTMLElement>();
    const counterRef = React.createRef<HTMLElement>();
    const leftChevronRef = React.createRef<HTMLElement>();
    const rightChevronRef = React.createRef<HTMLElement>();
    const requestFsCloseRef = { current: null };
    const cancelFsCloseRef = { current: null };

    const { container, root } = mount(
      React.createElement(
        FullscreenModal,
        {
          fsSub: { get: () => 0 },
          open: true,
          onClose: vi.fn(),
          isClick: { current: true },
          isAnimating: { current: false },
          overlayDivRef: { current: null },
          closeButtonRef,
          counterRef,
          leftChevronRef,
          rightChevronRef,
          cells: { current: [] },
          setShowFullscreenSlider: vi.fn(),
          cellCount: 1,
          setClosingModal: vi.fn(),
          slides: { current: [] },
          slider: { current: null },
          wrappedItems: [{ src: "/prev.jpg" }, { src: "/entry.jpg" }, { src: "/next.jpg" }],
          setSliderIndex: vi.fn(),
          onForceResetZoom: vi.fn(),
          layout: "entries",
          entryMapRef: { current: [{ entryIndex: 0, mediaIndex: 0 }] },
          entryMediaLayout: "slider",
          expandableImageRefs: { current: [] },
          resolveLayoutlessTarget: () => ({
            host: null,
            image: null,
            media: null,
          }),
          introFade: false,
          introDuration: { fade: 80, transform: 80 },
          introEasing: "linear",
          requestFsCloseRef,
          cancelFsCloseRef,
          fs: {
            closeScroll: false,
            controls: {
              close: {
                render: () => React.createElement("span", null, "close"),
              },
              counter: { enabled: false },
            },
            effects: {},
          },
          styles: { open: "open", closeBtn: "closeBtn", spinner: "spinner" },
          syncFullscreenSourceFromIndex: vi.fn(),
          introMethod: "scale",
          setLatchedIntroMethod: vi.fn(),
          latchedIntroIndex: 0,
        } as any,
        React.createElement("div", { className: "fullscreen_slider" })
      )
    );

    const closeButton = closeButtonRef.current as HTMLButtonElement | null;

    await clickClose(closeButton);
    expect(section.style.getPropertyValue("--rmg-entry-reveal-duration")).toBe("0ms");
    expect(skeleton.style.transition).toBe("none");
    expect(skeleton.style.opacity).toBe("0");
    expect(content.style.opacity).toBe("1");

    await flushAnimationFrame();

    await React.act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(section.style.getPropertyValue("--rmg-entry-reveal-duration")).toBe("320ms");
    expect(section.style.getPropertyValue("--rmg-entry-skeleton-exit-duration")).toBe("");
    expect(skeleton.style.transition).toBe("");
    expect(skeleton.style.opacity).toBe("0.25");
    expect(content.style.transition).toBe("opacity 120ms linear");
    expect(content.style.opacity).toBe("");

    unmount(root, container);
  });

  function setupDialogZoomCloseScenario(options: {
    isZoomed?: boolean;
    overlaysAboveIntroMedia?: boolean;
    introMethod?: "fade" | "scale";
    withTransformTarget?: boolean;
  }) {
    vi.useFakeTimers();

    const events: string[] = [];
    const destHost = document.createElement("div");
    const destImg = document.createElement("img");

    if (options.withTransformTarget) {
      destHost.setAttribute("data-rmg-test", "dialog-zoom-dest-host");
      destHost.setAttribute("data-rmg-idx", "0");
      destImg.setAttribute("data-rmg-test", "dialog-zoom-dest-img");
      destImg.src = "/target.jpg";
      destImg.style.objectFit = "cover";
      destImg.style.objectPosition = "50% 50%";
      destHost.appendChild(destImg);
      document.body.appendChild(destHost);

      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
        this: HTMLElement
      ) {
        const testId = this.getAttribute("data-rmg-test");
        if (testId === "dialog-zoom-dest-host") return rect(24, 120, 180, 200);
        if (testId === "dialog-zoom-dest-img") return rect(24, 120, 180, 200);
        if (testId === "dialog-zoom-fs-img") return rect(40, 80, 300, 420);
        if (this.classList.contains("fs_modal")) return rect(0, 0, 390, 700);
        return rect(0, 0, 390, 700);
      });

      Object.defineProperty(document, "elementsFromPoint", {
        configurable: true,
        value: vi.fn((x: number, y: number) => {
          const stack: Element[] = [];
          const shield = document.querySelector("[data-rmg-fs-shield='true']");
          if (shield) stack.push(shield);

          const pointHitsDest =
            x >= 24 &&
            x <= 204 &&
            y >= 120 &&
            y <= 320;

          if (pointHitsDest) stack.push(destImg, destHost);
          stack.push(document.body, document.documentElement);
          return stack;
        }),
      });
    }

    const closeButtonRef = React.createRef<HTMLElement>();
    const counterRef = React.createRef<HTMLElement>();
    const leftChevronRef = React.createRef<HTMLElement>();
    const rightChevronRef = React.createRef<HTMLElement>();
    const requestFsCloseRef = { current: null };
    const cancelFsCloseRef = { current: null };
    const prepareZoomOutForClose = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          window.setTimeout(() => {
            events.push("zoom-out");
            resolve();
          }, 220);
        })
    );
    const setClosingModal = vi.fn((value: boolean) => {
      events.push(`closing:${value}`);
    });

    const child = React.createElement(
      "div",
      { className: "fullscreen_slider" },
      React.createElement(
        "div",
        {
          "data-rmg-fs-slide": "true",
          "data-index": "0",
          "data-rmg-canonical-idx": "0",
        },
        React.createElement(
          "div",
          { "data-rmg-fs-media": "true" },
          React.createElement("img", {
            "data-rmg-test": "dialog-zoom-fs-img",
            src: "/fullscreen.jpg",
            style: {
              objectFit: "contain",
              objectPosition: "50% 50%",
            },
          })
        )
      )
    );

    const { container, root } = mount(
      React.createElement(
        FullscreenModal,
        {
          fsSub: { get: () => 0 },
          open: true,
          onClose: vi.fn(),
          isClick: { current: true },
          isAnimating: { current: false },
          overlayDivRef: { current: null },
          closeButtonRef,
          counterRef,
          leftChevronRef,
          rightChevronRef,
          cells: { current: [] },
          setShowFullscreenSlider: vi.fn(),
          cellCount: 1,
          setClosingModal,
          slides: { current: [] },
          slider: { current: null },
          wrappedItems: [{ src: "/prev.jpg" }, { src: "/entry.jpg" }, { src: "/next.jpg" }],
          setSliderIndex: vi.fn(),
          onForceResetZoom: vi.fn(),
          prepareZoomOutForClose,
          isZoomed: options.isZoomed ?? true,
          layout: "grid",
          expandableImageRefs: {
            current: options.withTransformTarget ? [{ current: destImg }] : [],
          },
          resolveLayoutlessTarget: () => ({
            host: options.withTransformTarget ? destHost : null,
            image: options.withTransformTarget ? destImg : null,
            media: options.withTransformTarget ? destHost : null,
          }),
          introFade: false,
          introDuration: { fade: 80, transform: 80 },
          introEasing: "linear",
          requestFsCloseRef,
          cancelFsCloseRef,
          fs: {
            overlaysAboveIntroMedia: options.overlaysAboveIntroMedia,
            dialog: { enabled: true },
            closeScroll: false,
            controls: {
              close: {
                render: () => React.createElement("span", null, "close"),
              },
              counter: { enabled: false },
            },
            effects: {},
          },
          styles: { open: "open", closeBtn: "closeBtn", spinner: "spinner" },
          syncFullscreenSourceFromIndex: vi.fn(),
          introMethod: options.introMethod ?? "scale",
          setLatchedIntroMethod: vi.fn(),
          latchedIntroIndex: 0,
        } as any,
        child
      )
    );

    const closeButton = closeButtonRef.current as HTMLButtonElement | null;

    return {
      closeButton,
      container,
      events,
      prepareZoomOutForClose,
      root,
    };
  }

  test("zooms out before closing a zoomed dialog when overlays are below the intro media", async () => {
    const {
      closeButton,
      container,
      events,
      prepareZoomOutForClose,
      root,
    } = setupDialogZoomCloseScenario({
      isZoomed: true,
      overlaysAboveIntroMedia: false,
    });

    await clickClose(closeButton);

    expect(prepareZoomOutForClose).toHaveBeenCalledWith({ durationMs: 220 });
    expect(events).toEqual([]);

    await React.act(async () => {
      vi.advanceTimersByTime(219);
      await Promise.resolve();
    });

    expect(events).toEqual([]);

    await React.act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(events).toEqual(["zoom-out", "closing:true"]);

    unmount(root, container);
  });

  test("uses transform close after staged zoom-out for a latched fade-opened dialog image", async () => {
    const {
      closeButton,
      container,
      events,
      prepareZoomOutForClose,
      root,
    } = setupDialogZoomCloseScenario({
      introMethod: "fade",
      isZoomed: true,
      overlaysAboveIntroMedia: false,
      withTransformTarget: true,
    });

    await clickClose(closeButton);

    expect(prepareZoomOutForClose).toHaveBeenCalledWith({ durationMs: 220 });
    expect(events).toEqual([]);

    await React.act(async () => {
      vi.advanceTimersByTime(220);
      await Promise.resolve();
    });

    await flushTransitionWarm();
    expect(events).toEqual(["zoom-out", "closing:true"]);
    await flushAnimationFrame();
    expect(container.querySelector("[data-rmg-fs-close-clipper='true']")).not.toBeNull();

    unmount(root, container);
  });

  test("does not stage a dialog zoom-out when overlays are not below the intro media", async () => {
    const {
      closeButton,
      container,
      events,
      prepareZoomOutForClose,
      root,
    } = setupDialogZoomCloseScenario({
      isZoomed: true,
      overlaysAboveIntroMedia: true,
    });

    await clickClose(closeButton);

    expect(prepareZoomOutForClose).not.toHaveBeenCalled();
    expect(events).toEqual(["closing:true"]);

    unmount(root, container);
  });
});
