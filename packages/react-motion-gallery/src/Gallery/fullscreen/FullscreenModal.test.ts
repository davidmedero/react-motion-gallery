// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import {
  FullscreenModal,
  resolveCenteredScrollTop,
  resolveCloseShieldReleaseMs,
  shouldUseFadeClose,
} from "./FullscreenModal";

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

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
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

describe("fullscreen close sequencing", () => {
  test("centers a grid thumb before starting the visible close animation", async () => {
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
    destImg.style.objectFit = "cover";
    destImg.style.objectPosition = "50% 50%";
    destHost.appendChild(destImg);
    document.body.appendChild(destHost);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const testId = this.getAttribute("data-rmg-test");
      if (testId === "dest-host") return rect(24, 900, 180, 200);
      if (testId === "dest-img") return rect(24, 900, 180, 200);
      if (testId === "fs-img") return rect(40, 80, 300, 420);
      if (this.classList.contains("fs_modal")) return rect(0, 0, 390, 700);
      return rect(0, 0, 390, 700);
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
          cellCount: 1,
          setClosingModal,
          slides: { current: [] },
          slider: { current: null },
          wrappedItems: [{ src: "/a.jpg" }, { src: "/b.jpg" }, { src: "/c.jpg" }],
          setSliderIndex: vi.fn(),
          onForceResetZoom: vi.fn(),
          layout: "grid",
          expandableImageRefs: { current: [{ current: destImg }] },
          resolveLayoutlessTarget: () => ({
            host: destHost,
            image: destImg,
            media: destHost,
          }),
          introFade: false,
          introDuration: 300,
          introEasing: "linear",
          requestFsCloseRef,
          cancelFsCloseRef,
          fs: {
            controls: {
              close: {
                render: () => React.createElement("span", null, "close"),
              },
              counter: { enabled: false },
            },
            effects: {},
          },
          styles: { open: "open", closeBtn: "closeBtn" },
          syncFullscreenSourceFromIndex: vi.fn(),
          introMethod: "scale",
          setLatchedIntroMethod: vi.fn(),
          latchedIntroIndex: 0,
        } as any,
        child
      )
    );

    const closeButton = container.querySelector(
      "button[aria-label='Close']"
    ) as HTMLButtonElement | null;
    expect(closeButton).not.toBeNull();

    await React.act(async () => {
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(events).toEqual(["scrollTo"]);
    expect(cancelFsCloseRef.current).toEqual(expect.any(Function));

    await flushAnimationFrame();
    expect(events).toEqual(["scrollTo"]);

    await flushAnimationFrame();
    expect(events).toEqual(["scrollTo"]);

    await flushAnimationFrame();
    expect(events).toEqual(["scrollTo"]);

    await React.act(async () => {
      vi.advanceTimersByTime(49);
      await Promise.resolve();
    });
    expect(events).toEqual(["scrollTo"]);

    await React.act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(events).toEqual(["scrollTo"]);

    await flushAnimationFrame();
    expect(events.slice(0, 2)).toEqual(["scrollTo", "closing:true"]);

    await flushAnimationFrame();
    await React.act(async () => {
      vi.advanceTimersByTime(380);
      await Promise.resolve();
    });

    expect(events).toContain("closing:false");

    unmount(root, container);
  });
});
