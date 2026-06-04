// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  buildMasonryColumnLayout,
  MasonryCore,
  seedUnmeasuredMasonryHeights,
} from "./Masonry";
import { masonryInfiniteScroll } from "./plugins/infiniteScroll";
import { masonryLoadMore } from "./plugins/loadMore";
import { masonryPagination } from "./plugins/pagination";
import { masonryVirtualization } from "./plugins/virtualization";
import {
  buildMasonrySkeletonPrediction,
  resolveActiveMasonryPredictionVariant,
} from "./prediction";
import Masonry from "./index";
import styles from "./Masonry.module.css";

type ResizeObserverEntryLike = {
  target: Element;
  contentRect: DOMRect;
};

let resizeObservers: MockResizeObserver[] = [];
let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn> | undefined;
let allowMasonryMeasurement = true;

class MockResizeObserver {
  callback: (
    entries: ResizeObserverEntryLike[],
    observer: MockResizeObserver,
  ) => void;
  targets = new Set<Element>();

  constructor(
    callback: (
      entries: ResizeObserverEntryLike[],
      observer: MockResizeObserver,
    ) => void,
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
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return [];
  }
}

function makeRect(
  args: {
    width?: number;
    height?: number;
    left?: number;
    top?: number;
  } = {},
): DOMRect {
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

function masonryRectForElement(el: Element): DOMRect {
  if (el instanceof HTMLElement && el.hasAttribute("data-rmg-idx")) {
    const index = Number(el.getAttribute("data-rmg-idx") ?? 0);
    return makeRect({
      width: 240,
      height: allowMasonryMeasurement ? 100 + index * 40 : Number.NaN,
    });
  }

  return makeRect({ width: 720, height: 480 });
}

function triggerResizeObservers() {
  for (const observer of resizeObservers) {
    if (observer.targets.size === 0) continue;

    observer.callback(
      Array.from(observer.targets).map((target) => ({
        target,
        contentRect: masonryRectForElement(target),
      })),
      observer,
    );
  }
}

async function settleMasonryMeasurements(cycles = 2) {
  for (let i = 0; i < cycles; i++) {
    await React.act(async () => {
      triggerResizeObservers();
      await Promise.resolve();
    });
  }
}

async function flushItemLifecycle(cycles = 4) {
  for (let i = 0; i < cycles; i++) {
    await React.act(async () => {
      await Promise.resolve();
      await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 0));
    });
  }
}

function findMasonryContentShell(container: HTMLElement): HTMLElement {
  const shell = container.querySelector("[data-rmg-masonry-content-ready]");
  if (!(shell instanceof HTMLElement)) {
    throw new Error("Unable to find masonry content shell");
  }
  return shell;
}

async function renderIntoRoot(root: Root, node: React.ReactNode) {
  await React.act(async () => {
    root.render(node);
    await Promise.resolve();
  });
}

beforeEach(() => {
  resizeObservers = [];
  allowMasonryMeasurement = true;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  getBoundingClientRectSpy = vi
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockImplementation(function getBoundingClientRectMock(this: Element) {
      return masonryRectForElement(this);
    });

  Object.defineProperty(window, "innerWidth", {
    value: 1024,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: 768,
    configurable: true,
  });
});

afterEach(() => {
  getBoundingClientRectSpy?.mockRestore();
  vi.unstubAllGlobals();
  resizeObservers = [];
});

function FancyCard(props: { label: string }) {
  return <article>{props.label}</article>;
}

describe("Masonry spans and positioned runtime", () => {
  test("distributes equal-height balanced items across columns instead of collapsing into the first lane", () => {
    expect(
      buildMasonryColumnLayout({
        itemCount: 6,
        columnCount: 3,
        placement: "balanced",
        heights: [0, 0, 0, 0, 0, 0],
        gapPx: 12,
      }),
    ).toEqual([0, 1, 2, 0, 1, 2]);
  });

  test("exposes measured Masonry.Item from the measured masonry subpath", () => {
    const markup = renderToStaticMarkup(
      <Masonry columns={3} gap={12}>
        <Masonry.Item
          span={2}
          className="feature-shell"
          style={{ padding: "8px" }}
        >
          <article className="card-shell">alpha</article>
        </Masonry.Item>
        <Masonry.Item span="full">
          <FancyCard label="beta" />
        </Masonry.Item>
      </Masonry>,
    );

    expect(Masonry.Item).toBeDefined();
    expect(Masonry.Item).toBeTypeOf("function");
    expect(markup).toContain("feature-shell");
    expect(markup).toContain("card-shell");
    expect(markup).toContain("padding:8px");
    expect(markup).toContain("--rmg-cols:3");
    expect(markup).toContain('data-rmg-idx="1"');
    expect(markup).toContain(">beta<");
  });

  test("client pagination narrows measured masonry items and preserves source indices", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={1}
        gap={12}
        plugins={[masonryPagination({ pageIndex: 1, pageSize: 1 })]}
      >
        <article>alpha</article>
        <article>beta</article>
        <article>gamma</article>
      </Masonry>,
    );

    expect(markup).not.toContain(">alpha<");
    expect(markup).toContain(">beta<");
    expect(markup).not.toContain(">gamma<");
    expect(markup).toContain('data-rmg-idx="1"');
  });

  test("server pagination leaves the supplied measured masonry window untouched", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={1}
        gap={12}
        plugins={[
          masonryPagination({
            mode: "server",
            pageIndex: 2,
            pageSize: 1,
            total: 12,
          }),
        ]}
      >
        <article>alpha</article>
        <article>beta</article>
        <article>gamma</article>
      </Masonry>,
    );

    expect(markup).toContain(">alpha<");
    expect(markup).toContain(">beta<");
    expect(markup).toContain(">gamma<");
  });

  test("load-more limits measured masonry items", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={1}
        gap={12}
        plugins={[masonryLoadMore({ visibleCount: 2 })]}
      >
        <article>alpha</article>
        <article>beta</article>
        <article>gamma</article>
      </Masonry>,
    );

    expect(markup).toContain(">alpha<");
    expect(markup).toContain(">beta<");
    expect(markup).not.toContain(">gamma<");
    expect(markup).toContain('data-rmg-idx="1"');
    expect(markup).not.toContain('data-rmg-idx="2"');
  });

  test("updates keyed measured masonry children without remounting positioned items", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const render = (label: string) => (
      <Masonry columns={1} gap={12}>
        <Masonry.Item key="slot" revealKey={label}>
          <article>{label}</article>
        </Masonry.Item>
      </Masonry>
    );

    try {
      await renderIntoRoot(root, render("alpha"));
      await settleMasonryMeasurements();

      const itemBefore = container.querySelector("[data-rmg-idx='0']");
      expect(itemBefore).toBeInstanceOf(HTMLElement);
      expect(container.textContent).toContain("alpha");

      await renderIntoRoot(root, render("beta"));
      await settleMasonryMeasurements();

      expect(container.textContent).not.toContain("alpha");
      expect(container.textContent).toContain("beta");
      expect(container.querySelector("[data-rmg-idx='0']")).toBe(itemBefore);
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("keeps a stable measured masonry skeleton layer when the reveal key changes", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const render = (label: string) => (
      <Masonry
        columns={1}
        gap={12}
        loading={{
          active: true,
          force: {
            enabled: true,
            showContent: true,
            skeletonOpacity: 1,
          },
          keepSkeletonMounted: true,
          skeleton: ({ revealKey }) => (
            <span data-test-skeleton-card="true">
              loading {String(revealKey)}
            </span>
          ),
          timing: { minVisibleMs: 0, exitMs: 0 },
          waitForMedia: false,
        }}
      >
        <Masonry.Item key="slot" revealKey={label}>
          <article>{label}</article>
        </Masonry.Item>
      </Masonry>
    );

    try {
      await renderIntoRoot(root, render("product-a"));
      await settleMasonryMeasurements();

      const skeletonBefore = container.querySelector(
        "[data-rmg-masonry-item-skeleton]",
      );
      const skeletonCardBefore = container.querySelector(
        "[data-test-skeleton-card]",
      );
      expect(skeletonBefore).toBeInstanceOf(HTMLElement);
      expect(skeletonBefore?.textContent).toContain("loading product-a");
      expect(skeletonCardBefore).toBeInstanceOf(HTMLElement);

      await renderIntoRoot(root, render("product-b"));
      await settleMasonryMeasurements();

      const skeletonAfter = container.querySelector(
        "[data-rmg-masonry-item-skeleton]",
      );
      const skeletonCardAfter = container.querySelector(
        "[data-test-skeleton-card]",
      );
      expect(skeletonAfter).toBe(skeletonBefore);
      expect(skeletonCardAfter).toBe(skeletonCardBefore);
      expect(skeletonAfter?.textContent).toContain("loading product-b");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("keeps settled measured masonry skeleton shimmer off until forced comparison loading", async () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => callback(performance.now()), 0),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const render = (loading: boolean) => (
      <Masonry
        columns={1}
        gap={12}
        reveal={{ staggerMs: 0 }}
        loading={{
          active: loading,
          force: loading
            ? {
                enabled: true,
                showContent: true,
                skeletonOpacity: 0.5,
              }
            : undefined,
          keepSkeletonMounted: true,
          waitForMedia: false,
          timing: { enterMs: 180, exitMs: 420, minVisibleMs: 0 },
          skeleton: () => <span>loading card</span>,
        }}
      >
        <Masonry.Item key="slot" revealKey="product-a">
          <article>alpha</article>
        </Masonry.Item>
      </Masonry>
    );

    try {
      await renderIntoRoot(root, render(false));
      await settleMasonryMeasurements();
      await flushItemLifecycle(12);

      const exitingSkeleton = container.querySelector<HTMLElement>(
        "[data-rmg-masonry-item-skeleton]",
      );
      expect(exitingSkeleton).not.toBeNull();
      expect(
        container.querySelector("[data-rmg-masonry-item-reveal='1']"),
      ).not.toBeNull();

      await React.act(async () => {
        const event = new Event("transitionend", { bubbles: true });
        Object.defineProperty(event, "propertyName", { value: "opacity" });
        exitingSkeleton?.dispatchEvent(event);
      });

      const settledSkeleton = container.querySelector<HTMLElement>(
        "[data-rmg-masonry-item-skeleton]",
      );
      expect(settledSkeleton).toBe(exitingSkeleton);
      expect(
        settledSkeleton?.getAttribute("data-rmg-masonry-item-shimmer"),
      ).toBe("off");

      await renderIntoRoot(root, render(true));

      const compareSkeleton = container.querySelector<HTMLElement>(
        "[data-rmg-masonry-item-skeleton]",
      );
      expect(compareSkeleton).toBe(settledSkeleton);
      expect(
        compareSkeleton?.getAttribute("data-rmg-masonry-item-shimmer"),
      ).toBeNull();
      expect(
        container.querySelector("[data-rmg-masonry-item-compare='1']"),
      ).not.toBeNull();
      expect(
        compareSkeleton?.style.getPropertyValue(
          "--rmg-masonry-item-skeleton-opacity",
        ),
      ).toBe("0.5");
      expect(
        compareSkeleton?.style.getPropertyValue(
          "--rmg-masonry-item-skeleton-enter-duration",
        ),
      ).toBe("180ms");
      expect(
        compareSkeleton?.style.getPropertyValue(
          "--rmg-masonry-item-skeleton-exit-duration",
        ),
      ).toBe("420ms");

      await React.act(async () => {
        const event = new Event("transitionend", { bubbles: true });
        Object.defineProperty(event, "propertyName", { value: "opacity" });
        compareSkeleton?.dispatchEvent(event);
      });

      expect(
        compareSkeleton?.getAttribute("data-rmg-masonry-item-shimmer"),
      ).toBeNull();
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
      if (originalRequestAnimationFrame) {
        Object.defineProperty(window, "requestAnimationFrame", {
          configurable: true,
          value: originalRequestAnimationFrame,
        });
      } else {
        delete (window as any).requestAnimationFrame;
      }
      if (originalCancelAnimationFrame) {
        Object.defineProperty(window, "cancelAnimationFrame", {
          configurable: true,
          value: originalCancelAnimationFrame,
        });
      } else {
        delete (window as any).cancelAnimationFrame;
      }
    }
  });

  test("stages measured masonry reveal-key swaps through a ready paint", async () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    let nextFrameId = 1;
    const queuedFrames = new Map<number, FrameRequestCallback>();
    const flushFrame = async () => {
      const frame = queuedFrames.entries().next().value as
        | [number, FrameRequestCallback]
        | undefined;
      if (!frame) return false;

      queuedFrames.delete(frame[0]);
      await React.act(async () => {
        frame[1](performance.now());
        await Promise.resolve();
      });
      return true;
    };
    const flushFrames = async (count: number) => {
      for (let index = 0; index < count; index += 1) {
        await flushFrame();
      }
    };

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        const id = nextFrameId++;
        queuedFrames.set(id, callback);
        return id;
      },
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => {
        queuedFrames.delete(id);
      },
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const render = (label: string) => (
      <Masonry
        columns={1}
        gap={12}
        loading={{
          skeleton: ({ revealKey }) => (
            <span data-test-skeleton="true">loading {String(revealKey)}</span>
          ),
          timing: { enterMs: 360, minVisibleMs: 0, exitMs: 0 },
          waitForMedia: false,
          rememberRevealed: false,
        }}
        reveal={{ staggerMs: 0, durationMs: 600, easing: "ease" }}
      >
        <Masonry.Item key="slot" revealKey={label}>
          <article>{label}</article>
        </Masonry.Item>
      </Masonry>
    );

    try {
      await renderIntoRoot(root, render("product-a"));
      await settleMasonryMeasurements();
      await flushFrames(6);
      await flushItemLifecycle(4);
      await flushFrames(6);
      await flushItemLifecycle(4);
      await flushFrames(6);

      const itemBefore = container.querySelector("[data-rmg-idx='0']");
      expect(itemBefore?.getAttribute("data-rmg-masonry-item-reveal")).toBe(
        "1",
      );

      await renderIntoRoot(root, render("product-b"));
      await settleMasonryMeasurements();

      const itemAfter = container.querySelector("[data-rmg-idx='0']");
      expect(itemAfter).toBe(itemBefore);
      expect(itemAfter?.getAttribute("data-rmg-masonry-item-reveal")).toBe("0");
      expect(
        container
          .querySelector<HTMLElement>("[data-rmg-masonry-item-skeleton]")
          ?.style.getPropertyValue(
            "--rmg-masonry-item-skeleton-enter-duration",
          ),
      ).toBe("0ms");

      await flushFrames(2);
      await flushItemLifecycle(1);
      expect(itemAfter?.getAttribute("data-rmg-masonry-item-reveal")).toBe("0");

      await flushFrames(2);
      await flushItemLifecycle(1);
      expect(itemAfter?.getAttribute("data-rmg-masonry-item-reveal")).toBe("0");

      await flushFrames(2);
      expect(itemAfter?.getAttribute("data-rmg-masonry-item-reveal")).toBe("1");
    } finally {
      queuedFrames.clear();
      if (originalRequestAnimationFrame) {
        Object.defineProperty(window, "requestAnimationFrame", {
          configurable: true,
          value: originalRequestAnimationFrame,
        });
      } else {
        delete (window as any).requestAnimationFrame;
      }
      if (originalCancelAnimationFrame) {
        Object.defineProperty(window, "cancelAnimationFrame", {
          configurable: true,
          value: originalCancelAnimationFrame,
        });
      } else {
        delete (window as any).cancelAnimationFrame;
      }
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("keeps measured masonry placeholder slots blocked until real content replaces them", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const skeletonArgs: Array<{
      revealKey?: React.Key;
      placeholder: boolean;
      ready: boolean;
    }> = [];
    const render = (label: string, placeholder: boolean) => (
      <Masonry
        columns={1}
        gap={12}
        loading={{
          skeleton: (args) => {
            skeletonArgs.push({
              revealKey: args.revealKey,
              placeholder: args.placeholder,
              ready: args.ready,
            });
            return (
              <span data-test-skeleton="true">
                loading {String(args.revealKey)}
              </span>
            );
          },
          timing: { minVisibleMs: 0 },
          waitForMedia: false,
        }}
      >
        <Masonry.Item revealKey={label} placeholder={placeholder}>
          <article>{label}</article>
        </Masonry.Item>
      </Masonry>
    );

    try {
      await renderIntoRoot(root, render("pending-product", true));
      await settleMasonryMeasurements();
      await flushItemLifecycle(6);

      const item = container.querySelector("[data-rmg-idx='0']");
      const skeletonBefore = container.querySelector(
        "[data-rmg-masonry-item-skeleton]",
      );
      expect(item?.getAttribute("data-rmg-masonry-item-placeholder")).toBe("1");
      expect(item?.getAttribute("data-rmg-masonry-item-reveal")).toBe("0");
      expect(skeletonBefore).toBeInstanceOf(HTMLElement);
      expect(skeletonBefore?.textContent).toContain(
        "loading pending-product",
      );
      expect(skeletonArgs).toContainEqual(
        expect.objectContaining({
          revealKey: "pending-product",
          placeholder: true,
          ready: false,
        }),
      );

      await renderIntoRoot(root, render("product-a", false));
      await settleMasonryMeasurements();

      const skeletonAfter = container.querySelector(
        "[data-rmg-masonry-item-skeleton]",
      );
      expect(skeletonAfter).toBe(skeletonBefore);
      expect(skeletonAfter?.textContent).toContain("loading product-a");
      expect(container.textContent).toContain("product-a");
      expect(skeletonArgs).toContainEqual(
        expect.objectContaining({
          revealKey: "product-a",
          placeholder: false,
          ready: false,
        }),
      );
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("infinite-scroll renders a measured masonry sentinel outside positioned items", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={1}
        gap={12}
        plugins={[
          masonryInfiniteScroll({
            hasMore: true,
            sentinel: <span>Loading more</span>,
          }),
        ]}
      >
        <article>alpha</article>
      </Masonry>,
    );

    expect(markup).toContain('data-rmg-data-sentinel="masonry"');
    expect(markup).toContain(">Loading more<");
  });

  test("loading data plugins keep measured masonry busy until loading clears", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const render = (loading: boolean) => (
      <Masonry
        columns={1}
        gap={12}
        plugins={[
          masonryPagination({
            pageIndex: 0,
            pageSize: 1,
            loading,
          }),
        ]}
      >
        <article>alpha</article>
      </Masonry>
    );

    try {
      await renderIntoRoot(root, render(true));
      await settleMasonryMeasurements();

      expect(
        findMasonryContentShell(container).getAttribute(
          "data-rmg-masonry-content-ready",
        ),
      ).toBe("false");

      await renderIntoRoot(root, render(false));
      await settleMasonryMeasurements();

      expect(
        findMasonryContentShell(container).getAttribute(
          "data-rmg-masonry-content-ready",
        ),
      ).toBe("true");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("renders measured masonry loading through the internal skeleton wrapper", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={2}
        gap={12}
        loading={{
          count: 2,
          skeleton: {
            layout: {
              kind: "masonry",
              item: {
                kind: "rect",
                style: {
                  width: "100%",
                  height: 120,
                },
              },
            },
          },
          timing: { exitMs: 1200 },
        }}
      >
        <article>alpha</article>
        <article>beta</article>
      </Masonry>,
    );

    expect(markup).toContain('data-rmg-skeleton-wrapper="true"');
    expect(markup).toContain('data-rmg-skeleton-ready="false"');
    expect(markup).toContain('data-rmg-mskel-index="0"');
    expect(markup).toContain('data-rmg-mskel-index="1"');
    expect(markup).toContain('data-rmg-masonry-item-stage="1"');
    expect(markup).toContain('data-rmg-masonry-item-reveal="0"');
    expect(markup).toContain(">alpha<");
    expect(markup).not.toContain(styles.revealContainer);
  });

  test("renders measured masonry loading functions as per-item skeleton layers", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={1}
        gap={12}
        loading={{
          skeleton: ({ index, ready }) => (
            <span data-test-skeleton={index} data-ready={String(ready)} />
          ),
          timing: { enterMs: 480, exitMs: 1200 },
        }}
      >
        <article>alpha</article>
      </Masonry>,
    );

    expect(markup).toContain('data-rmg-masonry-item-skeleton="true"');
    expect(markup).toContain('data-test-skeleton="0"');
    expect(markup).toContain('data-ready="false"');
    expect(markup).toContain("--rmg-masonry-item-skeleton-enter-duration:0ms");
    expect(markup).toContain("--rmg-masonry-item-skeleton-exit-duration:1200ms");
    expect(markup).toContain(">alpha<");
  });

  test("staggered measured loading reveal is based on the active queue, not absolute item index", async () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => callback(performance.now()), 0),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await renderIntoRoot(
        root,
        <MasonryCore
          items={[
            <article key="alpha">alpha</article>,
            <article key="beta">beta</article>,
          ]}
          masonryColumns={1}
          masonryGap={0}
          masonryInitialHeights={[100, 100]}
          masonryItemIndices={[6, 7]}
          masonryItemRevealKeys={["next-page-6", "next-page-7"]}
          masonryLoading={{
            skeleton: ({ index }) => (
              <span data-test-skeleton={index}>loading</span>
            ),
            timing: { minVisibleMs: 0, exitMs: 0 },
            waitForMedia: false,
          }}
          masonryReveal={{
            disabled: false,
            staggerMs: 80,
            durationMs: 600,
            easing: "ease",
            staggerLimit: 6,
          }}
          masonryRevealReady
          responsiveViewportWidth={1024}
        />,
      );

      await flushItemLifecycle(8);

      const first = container.querySelector("[data-rmg-idx='6']");
      const second = container.querySelector("[data-rmg-idx='7']");

      expect(first?.getAttribute("data-rmg-masonry-item-reveal")).toBe("1");
      expect(second?.getAttribute("data-rmg-masonry-item-reveal")).toBe("0");

      await React.act(async () => {
        await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 90));
      });
      await flushItemLifecycle(4);

      expect(second?.getAttribute("data-rmg-masonry-item-reveal")).toBe("1");
    } finally {
      if (originalRequestAnimationFrame) {
        Object.defineProperty(window, "requestAnimationFrame", {
          configurable: true,
          value: originalRequestAnimationFrame,
        });
      } else {
        delete (window as any).requestAnimationFrame;
      }
      if (originalCancelAnimationFrame) {
        Object.defineProperty(window, "cancelAnimationFrame", {
          configurable: true,
          value: originalCancelAnimationFrame,
        });
      } else {
        delete (window as any).cancelAnimationFrame;
      }
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("does not re-arm measured masonry skeleton loading after a responsive resize", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const view = (
      <Masonry
        columns={{ 0: 1, 900: 2 }}
        gap={12}
        loading={{
          count: 2,
          skeleton: {
            layout: {
              kind: "masonry",
              item: {
                kind: "rect",
                style: {
                  width: "100%",
                  height: 120,
                },
              },
            },
          },
          waitForMedia: false,
          timing: { minVisibleMs: 0, exitMs: 0 },
        }}
      >
        <Masonry.Item revealKey="alpha">
          <article>alpha</article>
        </Masonry.Item>
        <Masonry.Item revealKey="beta">
          <article>beta</article>
        </Masonry.Item>
      </Masonry>
    );

    try {
      await renderIntoRoot(root, view);
      await settleMasonryMeasurements();
      await flushItemLifecycle();

      const wrapper = () =>
        container.querySelector("[data-rmg-skeleton-wrapper]");
      const contentShell = () => findMasonryContentShell(container);

      expect(wrapper()?.getAttribute("data-rmg-skeleton-ready")).toBe("true");
      expect(
        contentShell().getAttribute("data-rmg-masonry-content-ready"),
      ).toBe("true");

      await React.act(async () => {
        Object.defineProperty(window, "innerWidth", {
          value: 640,
          configurable: true,
        });
        window.dispatchEvent(new Event("resize"));
        await Promise.resolve();
      });

      expect(wrapper()?.getAttribute("data-rmg-skeleton-ready")).toBe("true");
      expect(
        contentShell().getAttribute("data-rmg-masonry-content-ready"),
      ).toBe("true");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("holds measured loading items until each positioned item enters view", async () => {
    const observers: Array<{
      callback: IntersectionObserverCallback;
      target: Element | null;
      disconnect: () => void;
      observe: (target: Element) => void;
      takeRecords: () => IntersectionObserverEntry[];
      unobserve: () => void;
    }> = [];

    class DeferredIntersectionObserver {
      callback: IntersectionObserverCallback;
      target: Element | null = null;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        observers.push(this);
      }

      observe(target: Element) {
        this.target = target;
      }

      unobserve() {}

      disconnect() {}

      takeRecords() {
        return [];
      }
    }

    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => callback(performance.now()), 0),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });
    vi.stubGlobal("IntersectionObserver", DeferredIntersectionObserver);
    getBoundingClientRectSpy?.mockImplementation(
      function getBoundingClientRectMock(this: Element) {
        if (this instanceof HTMLElement && this.hasAttribute("data-rmg-idx")) {
          const index = Number(this.getAttribute("data-rmg-idx") ?? 0);
          const top = Number.parseFloat(this.style.top || "0") || 0;
          return makeRect({
            width: 240,
            height: index === 0 ? 1200 : 100,
            top,
          });
        }

        return makeRect({ width: 720, height: 480 });
      },
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await renderIntoRoot(
        root,
        <MasonryCore
          items={[
            <article key="alpha">alpha</article>,
            <article key="beta">beta</article>,
          ]}
          masonryColumns={1}
          masonryGap={0}
          masonryInitialHeights={[1200, 100]}
          masonryLoading={{
            skeleton: {
              layout: {
                kind: "masonry",
                item: {
                  kind: "rect",
                  style: { width: "100%", height: 100 },
                },
              },
            },
            timing: { minVisibleMs: 0 },
            waitForMedia: false,
          }}
          masonryReveal={{
            disabled: false,
            staggerMs: 0,
            durationMs: 600,
            easing: "ease",
          }}
          masonryRevealReady
          responsiveViewportWidth={1024}
        />,
      );
      await flushItemLifecycle(12);

      const first = container.querySelector("[data-rmg-idx='0']");
      const second = container.querySelector("[data-rmg-idx='1']");
      expect(first?.getAttribute("data-rmg-masonry-item-reveal")).toBe("1");
      expect(second?.getAttribute("data-rmg-masonry-item-reveal")).toBe("0");

      const secondObserver = observers.find(
        (observer) => observer.target === second,
      );
      expect(secondObserver).toBeDefined();
      if (!secondObserver?.target) {
        throw new Error("Expected offscreen item intersection observer");
      }

      await React.act(async () => {
        secondObserver.callback(
          [
            {
              target: secondObserver.target,
              isIntersecting: true,
              intersectionRatio: 1,
            } as IntersectionObserverEntry,
          ],
          secondObserver as unknown as IntersectionObserver,
        );
        await Promise.resolve();
      });
      await flushItemLifecycle(12);

      expect(second?.getAttribute("data-rmg-masonry-item-reveal")).toBe("1");
    } finally {
      if (originalRequestAnimationFrame) {
        Object.defineProperty(window, "requestAnimationFrame", {
          configurable: true,
          value: originalRequestAnimationFrame,
        });
      } else {
        delete (window as any).requestAnimationFrame;
      }
      if (originalCancelAnimationFrame) {
        Object.defineProperty(window, "cancelAnimationFrame", {
          configurable: true,
          value: originalCancelAnimationFrame,
        });
      } else {
        delete (window as any).cancelAnimationFrame;
      }
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("virtualization windows measured masonry positioned items", async () => {
    Object.defineProperty(window, "innerHeight", {
      value: 90,
      configurable: true,
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await renderIntoRoot(
        root,
        <MasonryCore
          items={Array.from({ length: 8 }, (_, index) => (
            <article key={index}>item {index}</article>
          ))}
          masonryColumns={1}
          masonryGap={10}
          masonryInitialHeights={Array.from({ length: 8 }, () => 40)}
          masonryVirtualization={
            masonryVirtualization({
              estimateSize: 40,
              gap: 10,
              overscan: 0,
            }).options as any
          }
          responsiveViewportWidth={1024}
        />,
      );

      await React.act(async () => {});

      expect(container.querySelectorAll("[data-rmg-idx]").length).toBeLessThan(
        8,
      );
      expect(container.querySelector("[data-rmg-idx='0']")).not.toBeNull();
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("uses the shared viewport width snapshot for responsive SSR positioned markup", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Masonry,
        {
          columns: { 0: 1, 720: 2, 1140: 3 },
          gap: 12,
        },
        React.createElement("div", null, "alpha"),
        React.createElement("div", null, "beta"),
        React.createElement("div", null, "gamma"),
      ),
    );

    expect(markup).toContain("--rmg-cols:2");
    expect(markup).toContain("--rmg-gap:12px");
    expect(markup.match(/data-rmg-idx=/g) ?? []).toHaveLength(6);
  });

  test("resolves responsive masonry markup from an explicit viewport snapshot", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonryCore, {
        items: ["alpha", "beta", "gamma"],
        masonryColumns: { 0: 1, 720: 2, 1140: 3 },
        masonryGap: { 0: 12, 1140: 18 },
        responsiveViewportWidth: 1280,
      }),
    );

    expect(markup).toContain("--rmg-cols:3");
    expect(markup).toContain("--rmg-gap:18px");
    expect(markup).toContain(
      'style="position:relative;width:100%;height:0px;--rmg-cols:3;--rmg-gap:18px"',
    );
    expect(markup.match(/data-rmg-idx=/g) ?? []).toHaveLength(3);
  });

  test("applies itemWrapClassName and itemWrapStyle to the masonry item wrapper", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Masonry,
        {
          columns: 1,
          gap: 12,
          classNames: {
            item: "legacy-shell",
          },
          itemWrapClassName: "wrap-shell",
          itemWrapStyle: {
            padding: "6px",
          },
        },
        "alpha",
      ),
    );

    expect(markup).toContain(
      'class="rmg__masonry-item legacy-shell wrap-shell"',
    );
    expect(markup).toContain("padding:6px");
    expect(markup).toContain("--rmg-reveal-index:0");
    expect(markup).toContain(">alpha<");
  });

  test("keeps live masonry content visible while the first measurement pass completes", async () => {
    allowMasonryMeasurement = false;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await renderIntoRoot(
        root,
        <Masonry columns={2} gap={12}>
          <article>alpha</article>
          <article>beta</article>
        </Masonry>,
      );

      const initialShell = findMasonryContentShell(container);
      expect(initialShell.getAttribute("data-rmg-masonry-content-ready")).toBe(
        "false",
      );
      expect(initialShell.style.opacity).toBe("");
      expect(initialShell.getAttribute("aria-hidden")).toBeNull();
      expect(container.querySelector(`.${styles.revealActive}`)).not.toBeNull();

      allowMasonryMeasurement = true;
      await settleMasonryMeasurements();

      const measuredShell = findMasonryContentShell(container);
      expect(measuredShell.getAttribute("data-rmg-masonry-content-ready")).toBe(
        "true",
      );
      expect(measuredShell.style.opacity).toBe("");
      expect(measuredShell.style.pointerEvents).toBe("");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("holds the masonry reveal until the root enters view", async () => {
    const observers: Array<{
      callback: IntersectionObserverCallback;
      target: Element | null;
      disconnect: () => void;
      observe: (target: Element) => void;
      takeRecords: () => IntersectionObserverEntry[];
      unobserve: () => void;
    }> = [];

    class DeferredIntersectionObserver {
      callback: IntersectionObserverCallback;
      target: Element | null = null;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        observers.push(this);
      }

      observe(target: Element) {
        this.target = target;
      }

      unobserve() {}

      disconnect() {}

      takeRecords() {
        return [];
      }
    }

    vi.stubGlobal("IntersectionObserver", DeferredIntersectionObserver);
    getBoundingClientRectSpy?.mockImplementation(
      function getBoundingClientRectMock(this: Element) {
        if (
          this instanceof HTMLElement &&
          this.classList.contains(styles.masonryRoot)
        ) {
          return makeRect({ width: 720, height: 480, top: 2000 });
        }

        return masonryRectForElement(this);
      },
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await renderIntoRoot(
        root,
        <Masonry columns={2} gap={12}>
          <article>alpha</article>
          <article>beta</article>
        </Masonry>,
      );
      await settleMasonryMeasurements();

      expect(container.querySelector(`.${styles.revealActive}`)).toBeNull();

      const rootObserver = observers.find(
        (observer) =>
          observer.target instanceof HTMLElement &&
          observer.target.classList.contains(styles.masonryRoot),
      );
      expect(rootObserver).toBeDefined();
      if (!rootObserver?.target) {
        throw new Error("Expected masonry root intersection observer");
      }

      await React.act(async () => {
        rootObserver.callback(
          [
            {
              target: rootObserver.target,
              isIntersecting: true,
              intersectionRatio: 1,
            } as IntersectionObserverEntry,
          ],
          rootObserver as unknown as IntersectionObserver,
        );
        await Promise.resolve();
      });

      expect(container.querySelector(`.${styles.revealActive}`)).not.toBeNull();
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("does not restore predicted seed heights after item measurement", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await renderIntoRoot(
        root,
        <MasonryCore
          items={[
            <article key="alpha">alpha</article>,
            <article key="beta">beta</article>,
            <article key="gamma">gamma</article>,
          ]}
          masonryColumns={2}
          masonryGap={12}
          masonryInitialHeights={[540, 736, 620]}
          responsiveViewportWidth={1024}
        />,
      );

      const third = container.querySelector(
        '[data-rmg-idx="2"]',
      ) as HTMLElement | null;
      expect(third).toBeInstanceOf(HTMLElement);
      expect(third?.style.top).toBe("112px");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("updates unmeasured horizontal-order positions when the skeleton seed is corrected", async () => {
    allowMasonryMeasurement = false;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const items = Array.from({ length: 6 }, (_, index) => (
      <article key={index}>item {index + 1}</article>
    ));
    const spans = [2, 1, 1, 2, 1, 1];

    try {
      await renderIntoRoot(
        root,
        <MasonryCore
          items={items}
          masonryColumns={4}
          masonryGap={18}
          masonryPlacement="horizontalOrder"
          masonrySpans={spans}
          masonryInitialHeights={[100, 100, 100, 100, 100, 100]}
          responsiveViewportWidth={1600}
          measurementKey="same-layout"
        />,
      );

      const fifth = container.querySelector(
        '[data-rmg-idx="4"]',
      ) as HTMLElement | null;
      expect(fifth).toBeInstanceOf(HTMLElement);
      expect(fifth?.style.top).toBe("118px");

      await renderIntoRoot(
        root,
        <MasonryCore
          items={items}
          masonryColumns={4}
          masonryGap={18}
          masonryPlacement="horizontalOrder"
          masonrySpans={spans}
          masonryInitialHeights={[100, 150, 160, 100, 100, 100]}
          responsiveViewportWidth={1600}
          measurementKey="same-layout"
        />,
      );

      expect(fifth?.style.top).toBe("168px");
    } finally {
      allowMasonryMeasurement = true;
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("ignores replacement skeleton seed arrays when the seed values are unchanged", async () => {
    allowMasonryMeasurement = false;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const items = Array.from({ length: 3 }, (_, index) => (
      <article key={index}>item {index + 1}</article>
    ));
    const measuredStates: boolean[] = [];
    const onLayoutMeasured = (measured: boolean) => {
      measuredStates.push(measured);
    };

    try {
      await renderIntoRoot(
        root,
        <MasonryCore
          items={items}
          masonryColumns={2}
          masonryGap={12}
          masonryInitialHeights={[100, 140, 180]}
          responsiveViewportWidth={1024}
          measurementKey="same-layout"
          onLayoutMeasured={onLayoutMeasured}
        />,
      );

      const callCountAfterFirstRender = measuredStates.length;

      await renderIntoRoot(
        root,
        <MasonryCore
          items={items}
          masonryColumns={2}
          masonryGap={12}
          masonryInitialHeights={[100, 140, 180]}
          responsiveViewportWidth={1024}
          measurementKey="same-layout"
          onLayoutMeasured={onLayoutMeasured}
        />,
      );

      expect(measuredStates).toHaveLength(callCountAfterFirstRender);
    } finally {
      allowMasonryMeasurement = true;
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("keeps live masonry visible while responsive placement inputs remeasure", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await renderIntoRoot(
        root,
        <Masonry columns={2} gap={12}>
          <Masonry.Item span={1}>
            <article>alpha</article>
          </Masonry.Item>
          <Masonry.Item span={1}>
            <article>beta</article>
          </Masonry.Item>
        </Masonry>,
      );
      await settleMasonryMeasurements();
      expect(findMasonryContentShell(container).style.opacity).toBe("");

      allowMasonryMeasurement = false;
      await renderIntoRoot(
        root,
        <Masonry columns={3} gap={18} placement="horizontalOrder">
          <Masonry.Item span={{ 0: "full", 900: 2 }}>
            <article>alpha</article>
          </Masonry.Item>
          <Masonry.Item span={1}>
            <article>beta</article>
          </Masonry.Item>
        </Masonry>,
      );

      expect(findMasonryContentShell(container).style.opacity).toBe("");
      const masonryRoot =
        container.querySelector("[data-rmg-idx='0']")?.parentElement;
      expect(masonryRoot).toBeInstanceOf(HTMLElement);
      expect((masonryRoot as HTMLElement).style.height).not.toBe("0px");

      allowMasonryMeasurement = true;
      await settleMasonryMeasurements();
      expect(findMasonryContentShell(container).style.opacity).toBe("");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      container.remove();
    }
  });

  test("initializes unmeasured masonry heights from shared skeleton prediction seeds", () => {
    expect(
      seedUnmeasuredMasonryHeights({
        itemCount: 3,
        previousHeights: [],
        measuredIndices: new Set(),
        initialHeights: [320, 280, 400],
      }),
    ).toEqual([320, 280, 400]);
  });

  test("reseeds only still-unmeasured items when responsive prediction changes", () => {
    expect(
      seedUnmeasuredMasonryHeights({
        itemCount: 3,
        previousHeights: [320, 280, 400],
        measuredIndices: new Set([1]),
        initialHeights: [300, 260, 420],
      }),
    ).toEqual([300, 280, 420]);
  });

  test("uses zero-height seeds when prediction is unavailable", () => {
    expect(
      seedUnmeasuredMasonryHeights({
        itemCount: 3,
        previousHeights: [],
        measuredIndices: new Set(),
        initialHeights: [undefined, 250],
      }),
    ).toEqual([0, 250, 0]);
  });

  test("seeds measured masonry first-paint positions from initial heights", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={3}
        gap={10}
        initialHeights={[100, 200, 300, 50]}
      >
        {["one", "two", "three", "four"].map((label) => (
          <Masonry.Item key={label}>
            <article>{label}</article>
          </Masonry.Item>
        ))}
      </Masonry>,
    );

    expect(markup).toContain("height:300px");
    expect(markup).toMatch(/data-rmg-idx="3"[^>]*top:110px/);
  });

  test("matches live balanced initial packing to the shared skeleton prediction at the SSR viewport width", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 4,
      columns: { 0: 1, 720: 2, 1140: 3 },
      gap: { 0: 12, 1140: 18 },
      placement: "balanced",
      spec: {
        layout: {
          kind: "masonry",
          itemWrapStyle: {
            padding: 12,
          },
          item: {
            kind: "col",
            style: {
              gap: 12,
              padding: 14,
            },
            children: [
              {
                kind: "rect",
                style: {
                  width: "100%",
                  aspectRatio: "4 / 5",
                },
              },
              {
                kind: "text",
                barHeight: 18,
                lineHeight: 1.35,
                lines: 2,
                style: {
                  width: "88%",
                },
              },
            ],
          },
          slots: [
            {},
            {
              item: {
                kind: "col",
                style: {
                  gap: 12,
                  padding: 14,
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "100%",
                      aspectRatio: "3 / 5",
                    },
                  },
                  {
                    kind: "text",
                    barHeight: 18,
                    lineHeight: 1.35,
                    lines: 2,
                    style: {
                      width: "88%",
                    },
                  },
                ],
              },
            },
            {},
            {
              item: {
                kind: "col",
                style: {
                  gap: 12,
                  padding: 14,
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "100%",
                      aspectRatio: "5 / 4",
                    },
                  },
                  {
                    kind: "text",
                    barHeight: 18,
                    lineHeight: 1.35,
                    lines: 2,
                    style: {
                      width: "88%",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });

    const active = resolveActiveMasonryPredictionVariant(
      prediction.variants,
      1024,
    );
    const seededHeights = seedUnmeasuredMasonryHeights({
      itemCount: active?.items.length ?? 0,
      previousHeights: [],
      measuredIndices: new Set(),
      initialHeights: active?.items.map((item) => item.height),
    });

    expect(active?.state.key).toBe("c2_g12");
    expect(
      buildMasonryColumnLayout({
        itemCount: seededHeights.length,
        columnCount: active?.state.columns ?? 0,
        placement: "balanced",
        heights: seededHeights,
        gapPx: active?.state.gapPx ?? 0,
      }),
    ).toEqual(active?.items.map((item) => item.columnIndex));
  });
});
