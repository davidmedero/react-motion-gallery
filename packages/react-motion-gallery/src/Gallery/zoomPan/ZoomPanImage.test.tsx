// @vitest-environment jsdom

import * as React from "react";
import { createRoot } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import {
  DEFAULT_ZOOM_PAN as rootDefaultZoomPan,
  Grid as RootGrid,
  Masonry as RootMasonry,
  ZoomPanImage as RootZoomPanImage,
} from "../../index";
import { RmgSlideProvider } from "../shared/slideContext";
import { createRmgSlideStoreBag } from "../shared/slideStoreBag";
import { createSliderIndexChannel } from "../slider/sliderSub";
import ZoomPanImageDefault, {
  DEFAULT_ZOOM_PAN,
  ZoomPanImage,
} from "../../zoomPan";

type Metrics = {
  left?: number;
  top?: number;
  width: number;
  height: number;
  naturalWidth?: number;
  naturalHeight?: number;
  offsetWidth?: number;
  offsetHeight?: number;
};

type SetupResult = {
  host: HTMLDivElement;
  render: (node?: React.ReactNode) => Promise<void>;
  cleanup: () => Promise<void>;
  getRoot: () => HTMLDivElement;
  getImage: () => HTMLImageElement;
};

function parseScale(transform: string) {
  const match = transform.match(/scale\(([-\d.]+)\)/);
  return match ? Number.parseFloat(match[1]) : 1;
}

function parseTranslate(transform: string) {
  const match = transform.match(/translate(?:3d)?\(([-\d.]+)px,\s*([-\d.]+)px/);
  return {
    x: match ? Number.parseFloat(match[1]) : 0,
    y: match ? Number.parseFloat(match[2]) : 0,
  };
}

function setImageMetrics(root: HTMLDivElement, img: HTMLImageElement, metrics: Metrics) {
  const {
    left = 0,
    top = 0,
    width,
    height,
    naturalWidth = 1200,
    naturalHeight = 900,
    offsetWidth = width,
    offsetHeight = height,
  } = metrics;

  root.getBoundingClientRect = () =>
    ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;

  Object.defineProperty(img, "naturalWidth", {
    configurable: true,
    get: () => naturalWidth,
  });
  Object.defineProperty(img, "naturalHeight", {
    configurable: true,
    get: () => naturalHeight,
  });
  Object.defineProperty(img, "offsetWidth", {
    configurable: true,
    get: () => offsetWidth,
  });
  Object.defineProperty(img, "offsetHeight", {
    configurable: true,
    get: () => offsetHeight,
  });
}

async function advanceMotion(ms = 64) {
  await React.act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

function makeTouch(clientX: number, clientY: number) {
  return { clientX, clientY } as Touch;
}

async function dispatchTouch(
  target: EventTarget,
  type: string,
  touches: Touch[],
  changedTouches: Touch[] = touches
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", { configurable: true, value: touches });
  Object.defineProperty(event, "changedTouches", { configurable: true, value: changedTouches });

  await React.act(async () => {
    target.dispatchEvent(event);
  });
}

async function setup(node: React.ReactNode): Promise<SetupResult> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  async function render(nextNode = node) {
    await React.act(async () => {
      root.render(nextNode);
    });
  }

  await render(node);

  return {
    host,
    render,
    cleanup: async () => {
      await React.act(async () => {
        root.unmount();
      });
      host.remove();
    },
    getRoot: () => host.querySelector("[data-rmg-zoom-pan-root='true']") as HTMLDivElement,
    getImage: () => host.querySelector("[data-rmg-zoom-pan-image='true']") as HTMLImageElement,
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

  if (typeof window.PointerEvent === "undefined") {
    vi.stubGlobal("PointerEvent", MouseEvent);
  }

  if (typeof window.IntersectionObserver === "undefined") {
    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  }
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ZoomPanImage", () => {
  test("renders root and image props on the correct elements", async () => {
    const view = await setup(
      <ZoomPanImage
        src="/alpha.jpg"
        alt="Alpha"
        className="demo-root"
        style={{ aspectRatio: "4 / 3", borderRadius: 24 }}
        imageClassName="demo-image"
        imageStyle={{ opacity: 0.9 }}
        srcSet="/alpha@2x.jpg 2x"
        sizes="50vw"
        loading="lazy"
        decoding="async"
        fetchPriority="high"
      />
    );

    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    expect(root.className).toContain("demo-root");
    expect(root.style.aspectRatio).toBe("4 / 3");
    expect(root.style.borderRadius).toBe("24px");
    expect(root.style.display).toBe("");
    expect(root.style.maxWidth).toBe("");
    expect(img.className).toContain("demo-image");
    expect(img.style.opacity).toBe("0.9");
    expect(img.getAttribute("src")).toBe("/alpha.jpg");
    expect(img.getAttribute("alt")).toBe("Alpha");
    expect(img.getAttribute("srcset")).toBe("/alpha@2x.jpg 2x");
    expect(img.getAttribute("sizes")).toBe("50vw");
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("decoding")).toBe("async");
    expect(img.getAttribute("fetchpriority")).toBe("high");
    expect(root.querySelector("[data-rmg-zoom-pan-stage='true']")).not.toBeNull();

    await view.cleanup();
  });

  test("click zooms in and a zoomed pointer click resets to scale 1", async () => {
    const view = await setup(<ZoomPanImage src="/alpha.jpg" alt="Alpha" />);
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

    const styleProto = Object.getPrototypeOf(img.style) as CSSStyleDeclaration;
    const transformDescriptor = Object.getOwnPropertyDescriptor(styleProto, "transform");
    let transformWriteCount = 0;

    expect(transformDescriptor?.set).toBeTypeOf("function");

    Object.defineProperty(img.style, "transform", {
      configurable: true,
      enumerable: true,
      get() {
        return transformDescriptor?.get?.call(this) ?? "";
      },
      set(value: string) {
        transformWriteCount += 1;
        transformDescriptor?.set?.call(this, value);
      },
    });

    await React.act(async () => {
      root.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
          clientX: 200,
          clientY: 150,
        })
      );
      document.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(transformWriteCount).toBe(1);
    expect(img.style.transition).toContain("300ms");

    await advanceMotion(350);
    expect(parseScale(img.style.transform)).toBe(1);

    Reflect.deleteProperty(img.style, "transform");
    await view.cleanup();
  });

  test("suppresses unzoomed drag-like clicks but still allows the next clean click to zoom", async () => {
    const view = await setup(<ZoomPanImage src="/alpha.jpg" alt="Alpha" />);
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    const dragClick = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: 206,
      clientY: 150,
    });

    let dragDispatchResult = true;
    await React.act(async () => {
      root.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
          pointerId: 1,
          clientX: 200,
          clientY: 150,
        })
      );
      root.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          button: 0,
          pointerId: 1,
          clientX: 206,
          clientY: 150,
        })
      );
      root.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          button: 0,
          pointerId: 1,
          clientX: 206,
          clientY: 150,
        })
      );
      dragDispatchResult = root.dispatchEvent(dragClick);
    });

    expect(dragDispatchResult).toBe(false);
    expect(dragClick.defaultPrevented).toBe(true);
    expect(parseScale(img.style.transform)).toBe(1);

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

    await view.cleanup();
  });

  test("keeps wheel panning inside the clipping container bounds", async () => {
    const view = await setup(<ZoomPanImage src="/alpha.jpg" alt="Alpha" />);
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    await React.act(async () => {
      root.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaX: -5000,
          deltaY: -5000,
        })
      );
    });
    await advanceMotion();

    let translate = parseTranslate(img.style.transform);
    expect(translate.x).toBeLessThanOrEqual(0);
    expect(translate.x).toBeGreaterThanOrEqual(-600);
    expect(translate.y).toBeLessThanOrEqual(0);
    expect(translate.y).toBeGreaterThanOrEqual(-450);

    await React.act(async () => {
      root.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaX: 5000,
          deltaY: 5000,
        })
      );
    });
    await advanceMotion();

    translate = parseTranslate(img.style.transform);
    expect(translate.x).toBeLessThanOrEqual(0);
    expect(translate.x).toBeGreaterThanOrEqual(-600);
    expect(translate.y).toBeLessThanOrEqual(0);
    expect(translate.y).toBeGreaterThanOrEqual(-450);

    await view.cleanup();
  });

  test("binds a native passive-false wheel listener and consumes ctrl-wheel zoom", async () => {
    const addEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, "addEventListener");
    const bubbleSpy = vi.fn();
    document.body.addEventListener("wheel", bubbleSpy);

    const view = await setup(<ZoomPanImage src="/alpha.jpg" alt="Alpha" />);
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    expect(
      addEventListenerSpy.mock.calls.some(
        ([type, , options]) =>
          type === "wheel" &&
          typeof options === "object" &&
          options != null &&
          "passive" in options &&
          options.passive === false
      )
    ).toBe(true);

    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      clientX: 200,
      clientY: 150,
      deltaY: -120,
    });

    let dispatchResult = true;
    await React.act(async () => {
      dispatchResult = root.dispatchEvent(event);
    });

    expect(dispatchResult).toBe(false);
    expect(event.defaultPrevented).toBe(true);
    expect(bubbleSpy).not.toHaveBeenCalled();
    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

    document.body.removeEventListener("wheel", bubbleSpy);
    addEventListenerSpy.mockRestore();
    await view.cleanup();
  });

  test("stops ancestor slider drag starts when a zoomed image owns the gesture", async () => {
    const sliderMouseDown = vi.fn();
    const sliderTouchStart = vi.fn();

    const view = await setup(
      <div data-rmg-slider-core-scope="demo-slider" onMouseDown={sliderMouseDown} onTouchStart={sliderTouchStart}>
        <ZoomPanImage src="/alpha.jpg" alt="Alpha" />
      </div>
    );

    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 550, height: 309, naturalWidth: 1600, naturalHeight: 900 });

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 275,
          clientY: 154,
        })
      );
    });

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          button: 0,
          clientX: 275,
          clientY: 154,
        })
      );
    });

    await dispatchTouch(root, "touchstart", [makeTouch(275, 154)]);

    expect(sliderMouseDown).not.toHaveBeenCalled();
    expect(sliderTouchStart).not.toHaveBeenCalled();

    await view.cleanup();
  });

  test("resets a zoomed slider image when slider scroll is triggered", async () => {
    const storeBag = createRmgSlideStoreBag();
    const indexChannel = createSliderIndexChannel();
    const view = await setup(
      <RmgSlideProvider value={{ normIdx: 0, isClone: false, storeBag, indexChannel }}>
        <ZoomPanImage src="/alpha.jpg" alt="Alpha" />
      </RmgSlideProvider>
    );

    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 550, height: 309, naturalWidth: 1600, naturalHeight: 900 });

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 275,
          clientY: 154,
        })
      );
    });

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

    await React.act(async () => {
      indexChannel.emitBasePointerDown();
    });

    expect(parseScale(img.style.transform)).toBe(1);
    expect(img.style.transition).toContain("0.2s");

    await advanceMotion(260);
    expect(img.style.transition).toBe("");

    await view.cleanup();
  });

  test("reanchors the slider to the zoomed image index when zooming in from another index", async () => {
    const storeBag = createRmgSlideStoreBag();
    const indexChannel = createSliderIndexChannel(1);
    const setSpy = vi.spyOn(indexChannel, "set");
    const view = await setup(
      <RmgSlideProvider value={{ normIdx: 0, isClone: false, storeBag, indexChannel }}>
        <ZoomPanImage src="/alpha.jpg" alt="Alpha" />
      </RmgSlideProvider>
    );

    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);
    expect(setSpy).toHaveBeenCalledWith(0, "animated", {
      meta: { source: "external" },
    });
    expect(indexChannel.get().index).toBe(0);

    setSpy.mockRestore();
    await view.cleanup();
  });

  test("does not reanchor the slider when the zoomed image already matches the current index", async () => {
    const storeBag = createRmgSlideStoreBag();
    const indexChannel = createSliderIndexChannel(0);
    const setSpy = vi.spyOn(indexChannel, "set");
    const view = await setup(
      <RmgSlideProvider value={{ normIdx: 0, isClone: false, storeBag, indexChannel }}>
        <ZoomPanImage src="/alpha.jpg" alt="Alpha" />
      </RmgSlideProvider>
    );

    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);
    expect(setSpy).not.toHaveBeenCalled();
    expect(indexChannel.get().index).toBe(0);

    setSpy.mockRestore();
    await view.cleanup();
  });

  test("resets a previously zoomed slider image when a different slider image zooms in", async () => {
    const storeBag = createRmgSlideStoreBag();
    const indexChannel = createSliderIndexChannel();
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    await React.act(async () => {
      root.render(
        <div>
          <RmgSlideProvider value={{ normIdx: 0, isClone: false, storeBag, indexChannel }}>
            <ZoomPanImage src="/alpha.jpg" alt="Alpha" />
          </RmgSlideProvider>
          <RmgSlideProvider value={{ normIdx: 1, isClone: false, storeBag, indexChannel }}>
            <ZoomPanImage src="/beta.jpg" alt="Beta" />
          </RmgSlideProvider>
        </div>
      );
    });

    const roots = Array.from(
      host.querySelectorAll<HTMLDivElement>("[data-rmg-zoom-pan-root='true']")
    );
    const images = Array.from(
      host.querySelectorAll<HTMLImageElement>("[data-rmg-zoom-pan-image='true']")
    );

    setImageMetrics(roots[0], images[0], { left: 0, width: 400, height: 300 });
    setImageMetrics(roots[1], images[1], { left: 450, width: 400, height: 300 });

    await React.act(async () => {
      roots[0].dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(images[0].style.transform)).toBeGreaterThan(1);
    expect(parseScale(images[1].style.transform)).toBe(1);

    await React.act(async () => {
      roots[1].dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 650,
          clientY: 150,
        })
      );
    });

    expect(parseScale(images[0].style.transform)).toBe(1);
    expect(images[0].style.transition).toContain("0.2s");
    expect(parseScale(images[1].style.transform)).toBeGreaterThan(1);

    await advanceMotion(260);
    expect(images[0].style.transition).toBe("");

    await React.act(async () => {
      root.unmount();
    });
    host.remove();
  });

  test("allows only one zoomed image at a time inside Grid", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    await React.act(async () => {
      root.render(
        <RootGrid columns={2} loading={{ enabled: false }}>
          <ZoomPanImage src="/alpha.jpg" alt="Alpha" />
          <ZoomPanImage src="/beta.jpg" alt="Beta" />
        </RootGrid>
      );
    });

    const roots = Array.from(
      host.querySelectorAll<HTMLDivElement>("[data-rmg-zoom-pan-root='true']")
    );
    const images = Array.from(
      host.querySelectorAll<HTMLImageElement>("[data-rmg-zoom-pan-image='true']")
    );

    setImageMetrics(roots[0], images[0], { left: 0, width: 400, height: 300 });
    setImageMetrics(roots[1], images[1], { left: 450, width: 400, height: 300 });

    await React.act(async () => {
      roots[0].dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(images[0].style.transform)).toBeGreaterThan(1);
    expect(parseScale(images[1].style.transform)).toBe(1);

    await React.act(async () => {
      roots[1].dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 650,
          clientY: 150,
        })
      );
    });

    expect(parseScale(images[0].style.transform)).toBe(1);
    expect(parseScale(images[1].style.transform)).toBeGreaterThan(1);

    await React.act(async () => {
      root.unmount();
    });
    host.remove();
  });

  test("allows only one zoomed image at a time inside Masonry", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    await React.act(async () => {
      root.render(
        <RootMasonry columns={2} gap={12} loading={{ enabled: false }}>
          <ZoomPanImage src="/alpha.jpg" alt="Alpha" />
          <ZoomPanImage src="/beta.jpg" alt="Beta" />
        </RootMasonry>
      );
    });

    const roots = Array.from(
      host.querySelectorAll<HTMLDivElement>("[data-rmg-zoom-pan-root='true']")
    );
    const images = Array.from(
      host.querySelectorAll<HTMLImageElement>("[data-rmg-zoom-pan-image='true']")
    );

    setImageMetrics(roots[0], images[0], { left: 0, width: 400, height: 300 });
    setImageMetrics(roots[1], images[1], { left: 450, width: 400, height: 300 });

    await React.act(async () => {
      roots[0].dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(images[0].style.transform)).toBeGreaterThan(1);
    expect(parseScale(images[1].style.transform)).toBe(1);

    await React.act(async () => {
      roots[1].dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 650,
          clientY: 150,
        })
      );
    });

    expect(parseScale(images[0].style.transform)).toBe(1);
    expect(parseScale(images[1].style.transform)).toBeGreaterThan(1);

    await React.act(async () => {
      root.unmount();
    });
    host.remove();
  });

  test("scopes ctrl-wheel and touch pinch gestures to the targeted instance", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    await React.act(async () => {
      root.render(
        <div>
          <ZoomPanImage src="/alpha.jpg" alt="Alpha" className="first" />
          <ZoomPanImage src="/beta.jpg" alt="Beta" className="second" />
        </div>
      );
    });

    const roots = Array.from(
      host.querySelectorAll<HTMLDivElement>("[data-rmg-zoom-pan-root='true']")
    );
    const images = Array.from(
      host.querySelectorAll<HTMLImageElement>("[data-rmg-zoom-pan-image='true']")
    );

    setImageMetrics(roots[0], images[0], { left: 0, width: 400, height: 300 });
    setImageMetrics(roots[1], images[1], { left: 450, width: 400, height: 300 });

    await React.act(async () => {
      roots[0].dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          ctrlKey: true,
          clientX: 200,
          clientY: 150,
          deltaY: -120,
        })
      );
    });

    expect(parseScale(images[0].style.transform)).toBeGreaterThan(1);
    expect(parseScale(images[1].style.transform)).toBe(1);

    await dispatchTouch(roots[0], "touchstart", [makeTouch(120, 120), makeTouch(280, 120)]);
    await dispatchTouch(roots[0], "touchmove", [makeTouch(90, 120), makeTouch(310, 120)]);
    await dispatchTouch(roots[0], "touchend", [], [makeTouch(90, 120), makeTouch(310, 120)]);

    expect(parseScale(images[0].style.transform)).toBeGreaterThan(1);
    expect(parseScale(images[1].style.transform)).toBe(1);

    await React.act(async () => {
      root.unmount();
    });
    host.remove();
  });

  test("resets zoom when src changes and when disabled becomes true", async () => {
    const view = await setup(<ZoomPanImage src="/alpha.jpg" alt="Alpha" />);
    let root = view.getRoot();
    let img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

    await view.render(<ZoomPanImage src="/beta.jpg" alt="Beta" />);
    root = view.getRoot();
    img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    expect(parseScale(img.style.transform)).toBe(1);

    await React.act(async () => {
      root.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
        })
      );
    });

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

    await view.render(<ZoomPanImage src="/beta.jpg" alt="Beta" disabled />);
    root = view.getRoot();
    img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    expect(parseScale(img.style.transform)).toBe(1);

    await view.cleanup();
  });

  test("exports the standalone surface from the root entry and the zoomPan subpath", () => {
    expect(ZoomPanImageDefault).toBe(ZoomPanImage);
    expect(RootZoomPanImage).toBe(ZoomPanImage);
    expect(rootDefaultZoomPan).toEqual(DEFAULT_ZOOM_PAN);
  });
});
