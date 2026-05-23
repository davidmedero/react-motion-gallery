// @vitest-environment jsdom

import * as React from "react";
import { createRoot } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { fullscreenZoomPan } from "../../fullscreen-zoom-pan";
import {
  DEFAULT_ZOOM_PAN as rootDefaultZoomPan,
  Grid as RootGrid,
  Masonry as RootMasonry,
  ZoomPanImage as RootZoomPanImage,
} from "../../index";
import { useFullscreenZoomPanRuntime } from "../fullscreen/zoomPanRuntime";
import { RmgSlideProvider } from "../shared/slideContext";
import { createRmgSlideStoreBag } from "../shared/slideStoreBag";
import { createSliderIndexChannel } from "../slider/sliderSub";
import ZoomPanImageDefault, {
  DEFAULT_ZOOM_PAN,
  ZoomPanImage,
} from "../../zoomPan";
import { zoomPanHover } from "../../zoomPan-hover";
import { DEFAULT_ZOOM_PAN as zoomPanDefaults } from "./defaults";

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

async function dispatchPointer(
  target: EventTarget,
  type: string,
  init: PointerEventInit & { pointerType?: string } = {}
) {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: init.button ?? 0,
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
    pointerId: init.pointerId ?? 1,
    ...init,
  });

  Object.defineProperty(event, "pointerType", {
    configurable: true,
    value: init.pointerType ?? "mouse",
  });
  Object.defineProperty(event, "pointerId", {
    configurable: true,
    value: init.pointerId ?? 1,
  });

  await React.act(async () => {
    target.dispatchEvent(event);
  });

  return event;
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

function FullscreenHoverRuntimeHarness(props: {
  zoom: any;
}) {
  const imageRef = React.useRef<HTMLDivElement | null>(null);
  const imageRefs = React.useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  imageRefs.current[0] = imageRef;

  const [scale, setScaleState] = React.useState(1);
  const scaleRef = React.useRef(1);
  const setScale = React.useCallback((nextScale: number) => {
    scaleRef.current = nextScale;
    setScaleState(nextScale);
  }, []);

  const currentImage = React.useRef<HTMLDivElement | null>(null);
  const previousZoom = React.useRef({ x: 0, y: 0 });
  const suppressLoopRef = React.useRef(false);
  const locX = React.useRef<any>(null);
  const prevX = React.useRef<any>(null);
  const offX = React.useRef<any>(null);
  const tgtX = React.useRef<any>(null);
  const locY = React.useRef<any>(null);
  const prevY = React.useRef<any>(null);
  const offY = React.useRef<any>(null);
  const tgtY = React.useRef<any>(null);
  const bodyX = React.useRef<any>(null);
  const bodyY = React.useRef<any>(null);
  const boundsX = React.useRef<any>(null);
  const boundsY = React.useRef<any>(null);
  const animRef = React.useRef<any>(null);
  const panRef = React.useRef({ x: 0, y: 0 });
  const changingSlides = React.useRef(false);
  const fullscreenSliderApi = React.useRef({ centerSlider: () => {} });
  const pointerDownRef = React.useRef(false);
  const interactionModeRef = React.useRef<any>(null);
  const axisRef = React.useRef<any>(null);
  const suppressNextClickRef = React.useRef(false);

  const runtime = useFullscreenZoomPanRuntime({
    fs: { zoom: props.zoom, caption: {}, effects: {} },
    entriesObject: { overlay: {}, render: {} },
    hasEntriesViewportOverlay: false,
    layout: "slider",
    resolveFsCaptionPlacement: () => null,
    windowSize: { width: 400, height: 300 },
    currentImage,
    scaleRef,
    setScale,
    previousZoom,
    suppressLoopRef,
    locX,
    prevX,
    offX,
    tgtX,
    locY,
    prevY,
    offY,
    tgtY,
    bodyX,
    bodyY,
    boundsX,
    boundsY,
    animRef,
    panRef,
    imageRefs,
    changingSlides,
    fullscreenSliderApi,
    isZoomed: scale > 1.01,
    pointerDownRef,
    interactionModeRef,
    axisRef,
    suppressNextClickRef,
    closingModal: false,
  });

  return (
    <div data-rmg-fs-track="true">
      <div data-rmg-fs-slide="true" data-index="0" data-rmg-canonical-idx="0">
        <div
          ref={imageRef}
          data-rmg-zoom-pan-root="true"
          data-rmg-fs-media="true"
          data-rmg-fs-media-viewport="true"
          onPointerEnter={(event) =>
            runtime.handleHoverPointerEnter(event, imageRef)
          }
          onPointerMove={(event) =>
            runtime.handleHoverPointerMove(event, imageRef)
          }
          onPointerLeave={(event) =>
            runtime.handleHoverPointerLeave(event, imageRef)
          }
        >
          <img
            alt="Fullscreen Alpha"
            data-rmg-zoom-pan-image="true"
            data-index="0"
            draggable="false"
            src="/alpha.jpg"
          />
        </div>
      </div>
    </div>
  );
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

  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("hover: hover") && query.includes("pointer: fine"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
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

  test("allows vertical touch page panning until the image is zoomed", async () => {
    const view = await setup(<ZoomPanImage src="/alpha.jpg" alt="Alpha" />);
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    expect(root.style.touchAction).toBe("pan-y");

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
    expect(root.style.touchAction).toBe("none");

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

    expect(transformWriteCount).toBe(2);
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

  test("smoothly zooms on mouse hover, pans with the cursor, and resets on leave", async () => {
    const view = await setup(
      <ZoomPanImage
        src="/alpha.jpg"
        alt="Alpha"
        zoom={{
          plugins: [
            zoomPanHover({
              zoomLevel: 2.5,
              zoomInDurationMs: 180,
              zoomOutDurationMs: 140,
            }),
          ],
        }}
      />
    );
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    const styleProto = Object.getPrototypeOf(img.style) as CSSStyleDeclaration;
    const transformDescriptor = Object.getOwnPropertyDescriptor(styleProto, "transform");
    const transformWrites: string[] = [];

    expect(transformDescriptor?.set).toBeTypeOf("function");

    Object.defineProperty(img.style, "transform", {
      configurable: true,
      enumerable: true,
      get() {
        return transformDescriptor?.get?.call(this) ?? "";
      },
      set(value: string) {
        transformWrites.push(value);
        transformDescriptor?.set?.call(this, value);
      },
    });

    await dispatchPointer(root, "pointerover", {
      clientX: 200,
      clientY: 150,
      pointerType: "mouse",
    });

    expect(parseScale(img.style.transform)).toBe(1);
    expect(img.style.transition).toBe("");
    expect(transformWrites[0]).toContain("scale(1)");

    await advanceMotion(80);
    const scaleDuringZoom = parseScale(img.style.transform);
    expect(scaleDuringZoom).toBeGreaterThan(1);
    expect(scaleDuringZoom).toBeLessThan(2.5);

    const zoomInWriteCount = transformWrites.length;
    await dispatchPointer(root, "pointermove", {
      clientX: 400,
      clientY: 300,
      pointerType: "mouse",
    });
    expect(transformWrites.length).toBe(zoomInWriteCount);

    await advanceMotion(16);
    expect(transformWrites.length).toBeGreaterThan(zoomInWriteCount);
    expect(parseScale(img.style.transform)).toBeGreaterThan(scaleDuringZoom);
    expect(img.style.transition).toBe("");

    await advanceMotion(180);

    const translate = parseTranslate(img.style.transform);
    expect(translate.x).toBeLessThan(-450);
    expect(translate.y).toBeLessThan(-320);
    expect(parseScale(img.style.transform)).toBe(2.5);

    await dispatchPointer(root, "pointerout", {
      clientX: 400,
      clientY: 300,
      pointerType: "mouse",
    });

    expect(parseScale(img.style.transform)).toBe(1);
    expect(parseTranslate(img.style.transform)).toEqual({ x: 0, y: 0 });
    expect(img.style.transition).toContain("140ms");

    await advanceMotion(180);
    expect(img.style.transition).toBe("");

    Reflect.deleteProperty(img.style, "transform");
    await view.cleanup();
  });

  test("does not activate hover zoom when disabled or for touch pointers", async () => {
    const view = await setup(
      <ZoomPanImage
        src="/alpha.jpg"
        alt="Alpha"
        disabled
        zoom={{ plugins: [zoomPanHover()] }}
      />
    );
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    await dispatchPointer(root, "pointerover", {
      clientX: 200,
      clientY: 150,
      pointerType: "mouse",
    });

    expect(parseScale(img.style.transform)).toBe(1);

    await view.render(
      <ZoomPanImage
        src="/alpha.jpg"
        alt="Alpha"
        zoom={{ plugins: [zoomPanHover()] }}
      />
    );
    const enabledRoot = view.getRoot();
    const enabledImg = view.getImage();
    setImageMetrics(enabledRoot, enabledImg, { width: 400, height: 300 });

    await dispatchPointer(enabledRoot, "pointerover", {
      clientX: 200,
      clientY: 150,
      pointerType: "touch",
    });

    expect(parseScale(enabledImg.style.transform)).toBe(1);

    await view.cleanup();
  });

  test("uses zoom-out timing for hover zoom-in when no zoom-in duration is set", async () => {
    const view = await setup(
      <ZoomPanImage
        src="/alpha.jpg"
        alt="Alpha"
        zoom={{
          plugins: [zoomPanHover({ zoomLevel: 2, zoomOutDurationMs: 190 })],
        }}
      />
    );
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    await dispatchPointer(root, "pointerover", {
      clientX: 200,
      clientY: 150,
      pointerType: "mouse",
    });

    expect(img.style.transition).toBe("");

    await advanceMotion(90);
    expect(parseScale(img.style.transform)).toBeGreaterThan(1);
    expect(parseScale(img.style.transform)).toBeLessThan(2);

    await advanceMotion(140);
    expect(parseScale(img.style.transform)).toBe(2);

    await dispatchPointer(root, "pointerout", {
      clientX: 200,
      clientY: 150,
      pointerType: "mouse",
    });

    expect(img.style.transition).toContain("190ms");

    await view.cleanup();
  });

  test("suppresses hover mouse clicks instead of toggling zoom before leave", async () => {
    const view = await setup(
      <ZoomPanImage
        src="/alpha.jpg"
        alt="Alpha"
        zoom={{ plugins: [zoomPanHover()] }}
      />
    );
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    await dispatchPointer(root, "pointerover", {
      clientX: 200,
      clientY: 150,
      pointerType: "mouse",
    });
    await advanceMotion(40);

    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

    await dispatchPointer(root, "pointerdown", {
      clientX: 200,
      clientY: 150,
      pointerType: "mouse",
      button: 0,
    });

    const click = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: 200,
      clientY: 150,
    });

    let dispatchResult = true;
    await React.act(async () => {
      dispatchResult = root.dispatchEvent(click);
    });

    expect(dispatchResult).toBe(false);
    expect(click.defaultPrevented).toBe(true);
    expect(parseScale(img.style.transform)).toBeGreaterThan(1);

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
        <RootGrid columns={2}>
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
        <RootMasonry columns={2} gap={12}>
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

  test("exports the hover plugin subpath", () => {
    expect(zoomPanHover).toBeTypeOf("function");
    expect(zoomPanHover()).toMatchObject({
      __rmgZoomPanPlugin: true,
      kind: "hover",
    });
  });

  test("passes hover zoom-pan plugins through the fullscreen zoomPan entry", () => {
    const hoverPlugin = zoomPanHover({
      zoomLevel: 2,
      zoomInDurationMs: 180,
      zoomOutDurationMs: 140,
    });
    const fullscreenPlugin = fullscreenZoomPan({
      ...zoomPanDefaults,
      plugins: [hoverPlugin],
    });

    expect(fullscreenPlugin).toMatchObject({
      __rmgFullscreenPlugin: true,
      kind: "zoom-pan",
      options: {
        zoom: {
          plugins: [hoverPlugin],
        },
      },
    });
    expect(fullscreenPlugin.runtime?.useZoomPanRuntime).toBeTypeOf("function");
  });

  test("fullscreen hover runtime transforms images and resets on leave", async () => {
    const hoverPlugin = zoomPanHover({
      zoomLevel: 2.25,
      zoomInDurationMs: 120,
      zoomOutDurationMs: 90,
    });
    const fullscreenPlugin = fullscreenZoomPan({
      ...zoomPanDefaults,
      plugins: [hoverPlugin],
    });
    const view = await setup(
      <FullscreenHoverRuntimeHarness
        zoom={(fullscreenPlugin.options as any).zoom}
      />
    );
    const root = view.getRoot();
    const img = view.getImage();
    setImageMetrics(root, img, { width: 400, height: 300 });

    const previousElementFromPoint = document.elementFromPoint;
    const elementFromPointSpy = vi.fn(() => img as Element);
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: elementFromPointSpy,
    });

    await React.act(async () => {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX: 200,
          clientY: 150,
          pointerId: 1,
          pointerType: "mouse",
        })
      );
    });

    await advanceMotion(56);
    expect(parseScale(img.style.transform)).toBeGreaterThan(1);
    expect(parseScale(img.style.transform)).toBeLessThan(2.25);
    expect(img.style.transition).toBe("");

    await React.act(async () => {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX: 400,
          clientY: 300,
          pointerId: 1,
          pointerType: "mouse",
        })
      );
    });
    await advanceMotion(120);

    const translate = parseTranslate(img.style.transform);
    expect(translate.x).toBeLessThan(-400);
    expect(translate.y).toBeLessThan(-280);
    expect(parseScale(img.style.transform)).toBe(2.25);

    elementFromPointSpy.mockReturnValue(null);

    await React.act(async () => {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX: 500,
          clientY: 350,
          pointerId: 1,
          pointerType: "mouse",
        })
      );
    });

    expect(parseScale(img.style.transform)).toBe(1);
    expect(parseTranslate(img.style.transform)).toEqual({ x: 0, y: 0 });
    expect(img.style.transition).toContain("90ms");

    if (previousElementFromPoint) {
      Object.defineProperty(document, "elementFromPoint", {
        configurable: true,
        value: previousElementFromPoint,
      });
    } else {
      Reflect.deleteProperty(document, "elementFromPoint");
    }
    await view.cleanup();
  });
});
