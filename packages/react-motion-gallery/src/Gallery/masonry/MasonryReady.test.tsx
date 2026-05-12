// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { Masonry, useMasonryReady } from "../../masonry";
import { masonryLazyLoad } from "../../masonry-lazy-load";
import type { MasonryHandle } from "./types";

type ResizeObserverEntryLike = {
  target: Element;
  contentRect: DOMRect;
};

let resizeObservers: MockResizeObserver[] = [];

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

class IdleIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

function makeRect(args: { width?: number; height?: number } = {}): DOMRect {
  const width = args.width ?? 240;
  const height = args.height ?? 120;

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

function masonryRectForElement(el: Element): DOMRect {
  if (el instanceof HTMLElement && el.hasAttribute("data-rmg-idx")) {
    const index = Number(el.getAttribute("data-rmg-idx") ?? 0);
    return makeRect({ width: 240, height: 100 + index * 40 });
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

async function settle(cycles = 2) {
  for (let i = 0; i < cycles; i++) {
    await React.act(async () => {
      triggerResizeObservers();
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  resizeObservers = [];
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
    this: Element
  ) {
    return masonryRectForElement(this);
  });

  Object.defineProperty(window, "innerWidth", {
    value: 1024,
    configurable: true,
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  resizeObservers = [];
});

describe("useMasonryReady", () => {
  test("flips after masonry media and layout measurements are ready", async () => {
    function ReadyProbe() {
      const masonry = useMasonryReady();
      return (
        <>
          <span data-ready={masonry.ready ? "true" : "false"} />
          <Masonry ref={masonry.ref} columns={2}>
            <article>One</article>
            <article>Two</article>
          </Masonry>
        </>
      );
    }

    const { root, container } = mount(<ReadyProbe />);

    await settle();
    expect(container.querySelector("[data-ready='true']")).not.toBeNull();

    unmount(root, container);
  });

  test("waits for masonry media before becoming ready", async () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockImplementation(function (
      this: HTMLImageElement
    ) {
      return this.getAttribute("data-loaded") === "true";
    });
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockImplementation(function (
      this: HTMLImageElement
    ) {
      return this.getAttribute("data-loaded") === "true" ? 800 : 0;
    });

    function ReadyProbe() {
      const masonry = useMasonryReady();
      return (
        <>
          <span data-ready={masonry.ready ? "true" : "false"} />
          <Masonry ref={masonry.ref} columns={1}>
            <img src="/image-a.jpg" alt="Image A" data-loaded="false" />
          </Masonry>
        </>
      );
    }

    const { root, container } = mount(<ReadyProbe />);
    await settle();

    expect(container.querySelector("[data-ready='false']")).not.toBeNull();

    const image = container.querySelector("img[alt='Image A']") as HTMLImageElement;
    await React.act(async () => {
      image.setAttribute("data-loaded", "true");
      image.dispatchEvent(new Event("load"));
      triggerResizeObservers();
      await Promise.resolve();
    });

    expect(container.querySelector("[data-ready='true']")).not.toBeNull();

    unmount(root, container);
  });

  test("does not mark base masonry images as lazy without the plugin", async () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(800);

    const { root, container } = mount(
      <Masonry columns={1}>
        <img src="/image-a.jpg" alt="Image A" />
      </Masonry>
    );
    await settle();

    const image = container.querySelector("img[alt='Image A']") as HTMLImageElement;
    expect(container.querySelector("[data-rmg-lazyload]")).toBeNull();
    expect(image.getAttribute("data-rmg-lazy-src")).toBeNull();
    expect(image.getAttribute("src")).toBe("/image-a.jpg");

    unmount(root, container);
  });

  test("uses the lazy-load plugin without waiting for eager image decode", async () => {
    vi.stubGlobal("IntersectionObserver", IdleIntersectionObserver);
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(false);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(0);

    function ReadyProbe() {
      const masonry = useMasonryReady();
      return (
        <>
          <span data-ready={masonry.ready ? "true" : "false"} />
          <Masonry ref={masonry.ref} columns={1} plugins={[masonryLazyLoad()]}>
            <img src="/image-a.jpg" alt="Image A" />
          </Masonry>
        </>
      );
    }

    const { root, container } = mount(<ReadyProbe />);
    await settle();

    const image = container.querySelector("img[alt='Image A']") as HTMLImageElement;
    expect(container.querySelector("[data-ready='true']")).not.toBeNull();
    expect(container.querySelector("[data-rmg-lazyload]")).not.toBeNull();
    expect(image.getAttribute("data-rmg-lazy-src")).toBe("/image-a.jpg");
    expect(image.getAttribute("src")).toContain("data:image/gif");

    unmount(root, container);
  });

  test("exposes root and item nodes on the masonry handle", async () => {
    const ref = React.createRef<MasonryHandle>();
    const { root, container } = mount(
      <Masonry ref={ref} columns={2}>
        <article>One</article>
        <article>Two</article>
      </Masonry>
    );

    await settle();

    const rootNode = ref.current?.getRootNode();
    const firstItem = container.querySelector("[data-rmg-idx='0']");
    expect(rootNode).toBeInstanceOf(HTMLElement);
    expect(firstItem).toBeInstanceOf(HTMLElement);
    expect(rootNode?.contains(firstItem)).toBe(true);
    expect(ref.current?.getItemNodes()).toHaveLength(2);
    expect(ref.current?.isReady()).toBe(true);

    unmount(root, container);
  });
});
