// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { Grid, useGridReady } from "../../grid";
import { gridLazyLoad } from "../../grid-lazy-load";
import type { GridHandle } from "./types";

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

class IdleIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

async function settle() {
  await React.act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 200,
    bottom: 120,
    width: 200,
    height: 120,
    toJSON: () => ({}),
  } as DOMRect));
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useGridReady", () => {
  test("flips after the grid reports ready", async () => {
    function ReadyProbe() {
      const grid = useGridReady();
      return (
        <>
          <span data-ready={grid.ready ? "true" : "false"} />
          <Grid ref={grid.ref} columns={2}>
            <article>One</article>
            <article>Two</article>
          </Grid>
        </>
      );
    }

    const { root, container } = mount(<ReadyProbe />);

    await settle();
    expect(container.querySelector("[data-ready='true']")).not.toBeNull();

    unmount(root, container);
  });

  test("waits for grid media before becoming ready", async () => {
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
      const grid = useGridReady();
      return (
        <>
          <span data-ready={grid.ready ? "true" : "false"} />
          <Grid ref={grid.ref} columns={1}>
            <img src="/image-a.jpg" alt="Image A" data-loaded="false" />
          </Grid>
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
      await Promise.resolve();
    });

    expect(container.querySelector("[data-ready='true']")).not.toBeNull();

    unmount(root, container);
  });

  test("does not mark base grid images as lazy without the plugin", async () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(800);

    const { root, container } = mount(
      <Grid columns={1}>
        <img src="/image-a.jpg" alt="Image A" />
      </Grid>
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
      const grid = useGridReady();
      return (
        <>
          <span data-ready={grid.ready ? "true" : "false"} />
          <Grid ref={grid.ref} columns={1} plugins={[gridLazyLoad()]}>
            <img src="/image-a.jpg" alt="Image A" />
          </Grid>
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

  test("exposes root and item nodes on the grid handle", async () => {
    const ref = React.createRef<GridHandle>();
    const { root, container } = mount(
      <Grid ref={ref} columns={2}>
        <article>One</article>
        <article>Two</article>
      </Grid>
    );

    await settle();

    expect(ref.current?.getRootNode()).toBe(container.querySelector("[data-rmg-grid-node='true']"));
    expect(ref.current?.getItemNodes()).toHaveLength(2);
    expect(ref.current?.isReady()).toBe(true);

    unmount(root, container);
  });
});
