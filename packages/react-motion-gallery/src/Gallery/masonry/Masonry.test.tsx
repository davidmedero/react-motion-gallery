// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Masonry as RootMasonry } from "../../index";
import MasonrySubpath from "../../masonry";
import {
  buildMasonryColumnLayout,
  MasonryCore,
  seedUnmeasuredMasonryHeights,
} from "./Masonry";
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
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  }

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return [];
  }
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
      observer
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

function findMasonryContentShell(container: HTMLElement): HTMLElement {
  const shell = container.querySelector('[data-rmg-masonry-content-ready]');
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
      })
    ).toEqual([0, 1, 2, 0, 1, 2]);
  });

  test("exposes Masonry.Item from the root entry and the masonry subpath", () => {
    const markup = renderToStaticMarkup(
      <Masonry columns={3} gap={12}>
        <Masonry.Item span={2} className="feature-shell" style={{ padding: "8px" }}>
          <article className="card-shell">alpha</article>
        </Masonry.Item>
        <Masonry.Item span="full">
          <FancyCard label="beta" />
        </Masonry.Item>
      </Masonry>
    );

    expect(Masonry.Item).toBeDefined();
    expect(RootMasonry.Item).toBe(Masonry.Item);
    expect(MasonrySubpath.Item).toBe(Masonry.Item);
    expect(markup).toContain("feature-shell");
    expect(markup).toContain("card-shell");
    expect(markup).toContain("padding:8px");
    expect(markup).toContain("--rmg-cols:3");
    expect(markup).toContain('data-rmg-idx="1"');
    expect(markup).toContain(">beta<");
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
        React.createElement("div", null, "gamma")
      )
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
      })
    );

    expect(markup).toContain("--rmg-cols:3");
    expect(markup).toContain("--rmg-gap:18px");
    expect(markup).toContain('style="position:relative;width:100%;height:0px;--rmg-cols:3;--rmg-gap:18px"');
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
        "alpha"
      )
    );

    expect(markup).toContain('class="rmg__masonry-item legacy-shell wrap-shell"');
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
        </Masonry>
      );

      const initialShell = findMasonryContentShell(container);
      expect(initialShell.getAttribute("data-rmg-masonry-content-ready")).toBe("false");
      expect(initialShell.style.opacity).toBe("");
      expect(initialShell.getAttribute("aria-hidden")).toBeNull();
      expect(container.querySelector(`.${styles.revealActive}`)).not.toBeNull();

      allowMasonryMeasurement = true;
      await settleMasonryMeasurements();

      const measuredShell = findMasonryContentShell(container);
      expect(measuredShell.getAttribute("data-rmg-masonry-content-ready")).toBe("true");
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
    getBoundingClientRectSpy?.mockImplementation(function getBoundingClientRectMock(
      this: Element
    ) {
      if (
        this instanceof HTMLElement &&
        this.classList.contains(styles.masonryRoot)
      ) {
        return makeRect({ width: 720, height: 480, top: 2000 });
      }

      return masonryRectForElement(this);
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await renderIntoRoot(
        root,
        <Masonry columns={2} gap={12}>
          <article>alpha</article>
          <article>beta</article>
        </Masonry>
      );
      await settleMasonryMeasurements();

      expect(container.querySelector(`.${styles.revealActive}`)).toBeNull();

      const rootObserver = observers.find(
        (observer) =>
          observer.target instanceof HTMLElement &&
          observer.target.classList.contains(styles.masonryRoot)
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
          rootObserver as unknown as IntersectionObserver
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
        />
      );

      const third = container.querySelector('[data-rmg-idx="2"]') as HTMLElement | null;
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
        />
      );

      const fifth = container.querySelector('[data-rmg-idx="4"]') as HTMLElement | null;
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
        />
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
        />
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
        />
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
        </Masonry>
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
        </Masonry>
      );

      expect(findMasonryContentShell(container).style.opacity).toBe("");
      const masonryRoot = container.querySelector("[data-rmg-idx='0']")?.parentElement;
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
      })
    ).toEqual([320, 280, 400]);
  });

  test("reseeds only still-unmeasured items when responsive prediction changes", () => {
    expect(
      seedUnmeasuredMasonryHeights({
        itemCount: 3,
        previousHeights: [320, 280, 400],
        measuredIndices: new Set([1]),
        initialHeights: [300, 260, 420],
      })
    ).toEqual([300, 280, 420]);
  });

  test("uses zero-height seeds when prediction is unavailable", () => {
    expect(
      seedUnmeasuredMasonryHeights({
        itemCount: 3,
        previousHeights: [],
        measuredIndices: new Set(),
        initialHeights: [undefined, 250],
      })
    ).toEqual([0, 250, 0]);
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

    const active = resolveActiveMasonryPredictionVariant(prediction.variants, 1024);
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
      })
    ).toEqual(active?.items.map((item) => item.columnIndex));
  });
});
