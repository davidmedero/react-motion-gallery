// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { Slider, useSliderReady } from "../../slider";
import { sliderArrows } from "./plugins/arrows";
import { sliderAutoPlay } from "./plugins/autoPlay";
import type { SliderHandle } from "./types";

type ResizeObserverEntryLike = {
  target: Element;
  contentRect: DOMRect;
};

let resizeObservers: MockResizeObserver[] = [];
let viewportRect = rect(600, 240);

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

function rect(width: number, height: number): DOMRect {
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
    observer.callback(
      Array.from(observer.targets).map((target) => ({
        target,
        contentRect: viewportRect,
      })),
      observer
    );
  }
}

async function settle(cycles = 1) {
  for (let i = 0; i < cycles; i++) {
    await React.act(async () => {
      triggerResizeObservers();
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
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

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  (globalThis as any).ResizeObserver = MockResizeObserver;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    if (this.getAttribute("data-rmg-part") === "viewport") return viewportRect;
    return rect(200, 120);
  });
});

afterEach(() => {
  resizeObservers = [];
  viewportRect = rect(600, 240);
  document.body.innerHTML = "";
});

afterAll(() => {
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  vi.restoreAllMocks();
});

describe("default slider core", () => {
  test("renders slides without default arrows or dots", async () => {
    const { container, root } = mount(
      <Slider>
        <article>One</article>
        <article>Two</article>
        <article>Three</article>
      </Slider>
    );
    await settle();

    expect(container.textContent).toContain("One");
    expect(container.textContent).toContain("Two");
    expect(container.querySelectorAll("[data-rmg-slide='true']")).toHaveLength(3);
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("[class*='pagination_dot']")).toBeNull();

    unmount(root, container);
  });

  test("keeps wheel navigation in the synchronous core path", async () => {
    const ref = React.createRef<SliderHandle>();
    const { container, root } = mount(
      <Slider ref={ref}>
        <article>One</article>
        <article>Two</article>
        <article>Three</article>
      </Slider>
    );
    await settle(3);
    await React.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const viewport = container.querySelector("[data-rmg-part='viewport']");
    expect(viewport).toBeInstanceOf(HTMLElement);

    React.act(() => {
      viewport?.dispatchEvent(
        new WheelEvent("wheel", {
          deltaY: 120,
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(ref.current?.getIndex()).toBe(1);

    unmount(root, container);
  });

  test("keeps click-like releases on the gesture start index", async () => {
    const ref = React.createRef<SliderHandle>();
    const { root, container } = mount(
      <Slider ref={ref}>
        <article>One</article>
        <article>Two</article>
        <article>Three</article>
        <article>Four</article>
        <article>Five</article>
        <article>Six</article>
      </Slider>
    );
    await settle(3);

    const rootNode = ref.current?.getRootNode();
    expect(rootNode).toBeInstanceOf(HTMLElement);

    React.act(() => {
      rootNode?.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          button: 0,
          clientX: 100,
          clientY: 20,
        })
      );
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          cancelable: true,
          clientX: 95,
          clientY: 20,
        })
      );
      document.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          clientX: 95,
          clientY: 20,
        })
      );
    });
    await settle(2);

    expect(ref.current?.getIndex()).toBe(0);

    unmount(root, container);
  });

  test("virtualizes fixed-stride loop sliders with bounded shells", async () => {
    const items = Array.from({ length: 30 }, (_, index) => (
      <article key={index}>Slide {index}</article>
    ));
    const { container, root } = mount(
      <Slider
        layout={{ gap: 12, cellsPerSlide: 5 }}
        scroll={{ loop: true, groupCells: true, skipSnaps: true }}
        virtualization={{ enabled: true, overscan: 2, threshold: 5 }}
      >
        {items}
      </Slider>
    );
    await settle(4);

    const slides = Array.from(
      container.querySelectorAll("[data-rmg-slide='true']")
    ) as HTMLElement[];
    const leadingClone = slides.find(
      (slide) => slide.getAttribute("data-rmg-rendered-idx") === "-2"
    );

    expect(slides.length).toBeGreaterThan(0);
    expect(slides.length).toBeLessThan(items.length);
    expect(leadingClone?.getAttribute("data-rmg-idx")).toBe("28");

    unmount(root, container);
  });

  test("publishes fixed slide main size to viewport and root scopes", async () => {
    const ref = React.createRef<SliderHandle>();
    const { container, root } = mount(
      <Slider ref={ref} layout={{ gap: 12, cellsPerSlide: 3 }}>
        {Array.from({ length: 8 }, (_, index) => (
          <article key={index}>Slide {index}</article>
        ))}
      </Slider>
    );
    await settle(4);

    const track = container.querySelector("[data-rmg-axis='x']") as HTMLElement;
    const viewport = container.querySelector("[data-rmg-part='viewport']") as HTMLElement;
    const rootNode = ref.current?.getRootNode();

    expect(track.style.getPropertyValue("--rmg-slide-main-size")).not.toBe("");
    expect(viewport.style.getPropertyValue("--rmg-slide-main-size")).toBe(
      track.style.getPropertyValue("--rmg-slide-main-size")
    );
    expect(rootNode?.style.getPropertyValue("--rmg-slide-main-size")).toBe(
      track.style.getPropertyValue("--rmg-slide-main-size")
    );

    unmount(root, container);
  });

  test("virtualized arrows preserve logical indexes without rendering every slide", async () => {
    const ref = React.createRef<SliderHandle>();
    const { container, root } = mount(
      <Slider
        ref={ref}
        layout={{ gap: 12, cellsPerSlide: 5 }}
        scroll={{ loop: true, groupCells: true }}
        virtualization={{ enabled: true, overscan: 2, threshold: 5 }}
      >
        {Array.from({ length: 30 }, (_, index) => (
          <article key={index}>Slide {index}</article>
        ))}
      </Slider>
    );
    await settle(4);

    React.act(() => {
      ref.current?.scrollNext();
    });
    await settle(4);

    expect(ref.current?.getIndex()).toBe(1);
    expect(container.querySelectorAll("[data-rmg-slide='true']").length).toBeLessThan(30);

    unmount(root, container);
  });

  test("virtualized loop seam keeps mounted shells and reports built nodes", async () => {
    const ref = React.createRef<SliderHandle>();
    const builtCounts: number[] = [];
    const { container, root } = mount(
      <Slider
        ref={ref}
        layout={{ gap: 12, cellsPerSlide: 5 }}
        scroll={{ loop: true, groupCells: true }}
        virtualization={{ enabled: true, overscan: 2, threshold: 5 }}
      >
        {Array.from({ length: 30 }, (_, index) => (
          <article key={index}>Slide {index}</article>
        ))}
      </Slider>
    );
    await settle(4);

    const unsubscribe = ref.current?.onSlidesBuilt((nodes) => {
      builtCounts.push(nodes.length);
    });

    React.act(() => {
      ref.current?.setIndex(5, "instant");
    });
    await settle(4);

    React.act(() => {
      ref.current?.scrollNext();
    });
    await settle(4);

    expect(container.querySelectorAll("[data-rmg-slide='true']").length).toBeGreaterThan(0);
    expect(container.querySelectorAll("[data-rmg-slide='true']").length).toBeLessThan(30);
    expect(builtCounts.length).toBeGreaterThan(0);
    expect(builtCounts.every((count) => count > 0)).toBe(true);

    unsubscribe?.();
    unmount(root, container);
  });

  test("virtualized free-scroll updates the rendered window from wheel coordinates", async () => {
    const { container, root } = mount(
      <Slider
        layout={{ gap: 12, cellsPerSlide: 5 }}
        scroll={{ freeScroll: true, loop: false }}
        virtualization={{ enabled: true, overscan: 1, threshold: 5 }}
      >
        {Array.from({ length: 40 }, (_, index) => (
          <article key={index}>Slide {index}</article>
        ))}
      </Slider>
    );
    await settle(4);

    const viewport = container.querySelector("[data-rmg-part='viewport']");
    expect(viewport).toBeInstanceOf(HTMLElement);

    React.act(() => {
      viewport?.dispatchEvent(
        new WheelEvent("wheel", {
          deltaX: 900,
          bubbles: true,
          cancelable: true,
        })
      );
    });
    await settle(2);

    const renderedIndexes = Array.from(
      container.querySelectorAll("[data-rmg-slide='true']")
    ).map((slide) => Number(slide.getAttribute("data-rmg-rendered-idx")));

    expect(renderedIndexes.some((index) => index > 5)).toBe(true);
    expect(renderedIndexes.length).toBeLessThan(40);

    unmount(root, container);
  });

  test("falls back to full rendering for variable slider layouts", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container, root } = mount(
      <Slider virtualization={{ enabled: true, threshold: 5 }}>
        {Array.from({ length: 12 }, (_, index) => (
          <article key={index}>Slide {index}</article>
        ))}
      </Slider>
    );
    await settle(4);

    expect(container.querySelectorAll("[data-rmg-slide='true']")).toHaveLength(12);
    expect(warnSpy).toHaveBeenCalledOnce();

    warnSpy.mockRestore();
    unmount(root, container);
  });

  test("keeps mutation methods on the core ref", async () => {
    const ref = React.createRef<SliderHandle>();
    const { container, root } = mount(
      <Slider ref={ref}>
        <article>One</article>
      </Slider>
    );
    await settle();

    React.act(() => {
      ref.current?.append(<article>Added</article>);
    });
    await settle();

    expect(container.textContent).toContain("Added");
    expect(container.querySelectorAll("[data-rmg-slide='true']")).toHaveLength(2);

    React.act(() => {
      ref.current?.prepend(<article>Prepended</article>);
    });
    await settle();

    expect(container.textContent).toContain("Prepended");
    expect(container.querySelectorAll("[data-rmg-slide='true']")).toHaveLength(3);

    React.act(() => {
      ref.current?.insert(1, <article>Inserted</article>);
    });
    await settle();

    expect(container.textContent).toContain("Inserted");
    expect(container.querySelectorAll("[data-rmg-slide='true']")).toHaveLength(4);

    React.act(() => {
      ref.current?.replace(2, <article>Replaced</article>);
    });
    await settle();

    expect(container.textContent).toContain("Replaced");

    React.act(() => {
      ref.current?.remove((index) => index % 2 === 0);
    });
    await settle();

    expect(container.querySelectorAll("[data-rmg-slide='true']")).toHaveLength(2);

    React.act(() => {
      ref.current?.setItems([<article key="solo">Solo</article>]);
    });
    await settle();

    expect(container.textContent).toContain("Solo");
    expect(container.querySelectorAll("[data-rmg-slide='true']")).toHaveLength(1);

    unmount(root, container);
  });

  test("renders only requested control plugins", async () => {
    const { container, root } = mount(
      <Slider
        plugins={[
          sliderArrows({
            render: ({ dir }) => (
              <div data-testid={`plugin-arrow-${dir}`}>Plugin arrow</div>
            ),
          }),
        ]}
      >
        <article>One</article>
        <article>Two</article>
      </Slider>
    );

    expect(container.textContent).toContain("One");
    await settle();

    expect(container.querySelector("[data-testid='plugin-arrow-next']")).not.toBeNull();
    expect(container.querySelector("[data-rmg-part='dots']")).toBeNull();

    unmount(root, container);
  });

  test("auto play plugin pauses on hover and pointer down by default", async () => {
    const ref = React.createRef<SliderHandle>();
    const { root, container } = mount(
      <Slider ref={ref} plugins={[sliderAutoPlay({ speedMs: 1000, pauseMs: 1000 })]}>
        <article>One</article>
        <article>Two</article>
        <article>Three</article>
      </Slider>
    );
    await settle();

    const rootNode = ref.current?.getRootNode();
    expect(rootNode).toBeInstanceOf(HTMLElement);
    expect(ref.current?.getAutoPlayTimer().active).toBe(true);

    React.act(() => {
      rootNode?.dispatchEvent(new MouseEvent("mouseenter"));
    });

    expect(ref.current?.getAutoPlayTimer().active).toBe(false);

    React.act(() => {
      rootNode?.dispatchEvent(new MouseEvent("mouseleave"));
    });

    expect(ref.current?.getAutoPlayTimer().active).toBe(true);

    React.act(() => {
      rootNode?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(ref.current?.getAutoPlayTimer().active).toBe(false);

    React.act(() => {
      window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    });

    expect(ref.current?.getAutoPlayTimer().active).toBe(false);

    unmount(root, container);
  });

  test("separates DOM-built and settled ready signals", async () => {
    viewportRect = rect(0, 240);
    const ref = React.createRef<SliderHandle>();
    const { root, container } = mount(
      <Slider ref={ref}>
        <article>One</article>
        <article>Two</article>
      </Slider>
    );

    expect(ref.current?.isSlidesBuilt()).toBe(true);
    expect(ref.current?.isReady()).toBe(false);

    viewportRect = rect(600, 240);
    await settle();

    expect(ref.current?.isReady()).toBe(true);

    unmount(root, container);
  });

  test("useSliderReady flips after the settled ready signal", async () => {
    viewportRect = rect(0, 240);
    function ReadyProbe() {
      const slider = useSliderReady();
      return (
        <>
          <span data-ready={slider.ready ? "true" : "false"} />
          <Slider ref={slider.ref}>
            <article>One</article>
            <article>Two</article>
          </Slider>
        </>
      );
    }

    const { root, container } = mount(<ReadyProbe />);

    expect(container.querySelector("[data-ready='false']")).not.toBeNull();
    viewportRect = rect(600, 240);
    await settle();
    expect(container.querySelector("[data-ready='true']")).not.toBeNull();

    unmount(root, container);
  });

  test("useSliderReady waits for visible slide media before fading in content", async () => {
    const completeSpy = vi
      .spyOn(HTMLImageElement.prototype, "complete", "get")
      .mockImplementation(function (this: HTMLImageElement) {
        return this.getAttribute("data-loaded") === "true";
      });

    function ReadyProbe() {
      const slider = useSliderReady();
      return (
        <>
          <span data-ready={slider.ready ? "true" : "false"} />
          <Slider ref={slider.ref}>
            <img src="/slide-a.jpg" alt="Slide A" data-loaded="false" />
            <img src="/slide-b.jpg" alt="Slide B" data-loaded="true" />
          </Slider>
        </>
      );
    }

    const { root, container } = mount(<ReadyProbe />);
    await settle();

    expect(container.querySelector("[data-ready='false']")).not.toBeNull();

    const image = container.querySelector("img[alt='Slide A']") as HTMLImageElement;
    await React.act(async () => {
      image.setAttribute("data-loaded", "true");
      image.dispatchEvent(new Event("load"));
      await Promise.resolve();
    });

    expect(container.querySelector("[data-ready='true']")).not.toBeNull();

    completeSpy.mockRestore();
    unmount(root, container);
  });

  test("useSliderReady preserves a pending media gate across same-slider handle refreshes", async () => {
    const completeSpy = vi
      .spyOn(HTMLImageElement.prototype, "complete", "get")
      .mockImplementation(function (this: HTMLImageElement) {
        return this.getAttribute("data-loaded") === "true";
      });

    function RefreshingHandleProbe() {
      const slider = useSliderReady();
      const rootRef = React.useRef<HTMLDivElement | null>(null);
      const [version, setVersion] = React.useState(0);

      React.useLayoutEffect(() => {
        const rootNode = rootRef.current;
        if (!rootNode) return;

        const handle: SliderHandle = {
          centerSlider: vi.fn(),
          getIndex: () => 0,
          setIndex: vi.fn(),
          subscribeIndex: () => () => {},
          getAutoPlayTimer: () => ({
            active: false,
            speedMs: 0,
            startedAt: null,
            elapsedMs: 0,
            remainingMs: 0,
            progress: 0,
          }),
          slideIndexForCell: (index) => index,
          getRootNode: () => rootNode,
          getContainerNode: () => rootNode,
          getSlideNodes: () =>
            Array.from(rootNode.querySelectorAll("[data-rmg-slide='true']")) as HTMLElement[],
          getViewportNode: () => rootNode,
          onSlidesBuilt: (cb) => {
            cb([]);
            return () => {};
          },
          whenSlidesBuilt: () => Promise.resolve([]),
          isSlidesBuilt: () => true,
          onReady: (cb) => {
            cb([]);
            return () => {};
          },
          whenReady: () => Promise.resolve([]),
          isReady: () => true,
          scrollNext: vi.fn(),
          scrollPrev: vi.fn(),
          canScrollNext: () => false,
          canScrollPrev: () => false,
          scrollProgress: () => 1,
          cellsInView: () => [0],
          getInternals: () => ({
            slides: { current: [] },
            slider: rootRef,
            visibleImages: { current: 0 },
            selectedIndex: { current: 0 },
            sliderX: { current: 0 },
            sliderVelocity: { current: 0 },
            isWrapping: { current: false },
          }),
          setIndexFromUi: vi.fn(),
        };

        slider.ref(handle);
        return () => slider.ref(null);
      }, [slider.ref, version]);

      return (
        <>
          <span data-ready={slider.ready ? "true" : "false"} />
          <button type="button" onClick={() => setVersion((value) => value + 1)}>
            refresh
          </button>
          <div ref={rootRef}>
            <div data-rmg-slide="true" data-rmg-idx="0">
              <img src="/slide-a.jpg" alt="Slide A" data-loaded="false" />
            </div>
          </div>
        </>
      );
    }

    const { root, container } = mount(<RefreshingHandleProbe />);

    expect(container.querySelector("[data-ready='false']")).not.toBeNull();

    await React.act(async () => {
      container.querySelector("button")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
      await Promise.resolve();
    });

    expect(container.querySelector("[data-ready='false']")).not.toBeNull();

    const image = container.querySelector("img[alt='Slide A']") as HTMLImageElement;
    await React.act(async () => {
      image.setAttribute("data-loaded", "true");
      image.dispatchEvent(new Event("load"));
      await Promise.resolve();
    });

    expect(container.querySelector("[data-ready='true']")).not.toBeNull();

    completeSpy.mockRestore();
    unmount(root, container);
  });
});
