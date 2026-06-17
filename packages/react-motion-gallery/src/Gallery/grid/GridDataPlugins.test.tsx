// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GalleryCore, useGalleryCore } from "../core";
import { useFullscreenController } from "../fullscreen";
import type { FullscreenPlugin } from "../fullscreen/types";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import type { GridSkeletonSpec } from "../skeleton/grid";
import Grid from "./index";
import { gridFullscreen } from "./plugins/fullscreen";
import { gridInfiniteScroll } from "./plugins/infiniteScroll";
import { gridLoadMore } from "./plugins/loadMore";
import {
  GridPaginationControls,
  gridPagination,
  useGridPagination,
} from "./plugins/pagination";
import { gridVirtualization } from "./plugins/virtualization";

let mountedRoot: Root | null = null;
let mountedHost: HTMLDivElement | null = null;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  callback: IntersectionObserverCallback;
  target: Element | null = null;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.target = target;
  }

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return [];
  }

  trigger(isIntersecting: boolean) {
    if (!this.target) return;

    this.callback(
      [
        {
          target: this.target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

const testFullscreenRuntime = {
  __rmgFullscreenPlugin: true,
  kind: "slider",
  RuntimeHost: () => null,
} as unknown as FullscreenPlugin;

function mount(node: React.ReactNode) {
  mountedHost = document.createElement("div");
  document.body.appendChild(mountedHost);
  mountedRoot = createRoot(mountedHost);
  React.act(() => {
    mountedRoot?.render(node);
  });
  return mountedHost;
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    window.setTimeout(resolve, 0);
  });
}

async function flushItemReveal() {
  await React.act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  });

  for (let index = 0; index < 4; index += 1) {
    await React.act(async () => {
      await nextFrame();
    });
  }
}

async function waitMs(ms: number) {
  await React.act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, ms));
  });
}

function renderCards(plugins: React.ComponentProps<typeof Grid>["plugins"]) {
  return renderToStaticMarkup(
    <Grid columns={1} gap={8} plugins={plugins}>
      <article>alpha</article>
      <article>beta</article>
      <article>gamma</article>
    </Grid>,
  );
}

function GridFullscreenProbe({
  onOpen,
}: {
  onOpen: (request: {
    source: string;
    index: number;
    image: HTMLImageElement | null;
  }) => void;
}) {
  const core = useGalleryCore();
  useFullscreenController({
    fullscreen: { enabled: true },
    plugins: [testFullscreenRuntime],
  });

  React.useEffect(
    () => core.fsOpenSub.subscribe(onOpen as any),
    [core, onOpen],
  );

  return (
    <Grid
      columns={1}
      plugins={[
        gridPagination({ pageIndex: 1, pageSize: 1 }),
        gridFullscreen(),
      ]}
    >
      <article>
        <img src="/a.jpg" alt="A" />
      </article>
      <article>
        <img src="/b.jpg" alt="B" />
      </article>
    </Grid>
  );
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  MockIntersectionObserver.instances = [];
  window.sessionStorage.clear();
});

afterEach(() => {
  if (mountedRoot) {
    React.act(() => {
      mountedRoot?.unmount();
    });
  }
  mountedRoot = null;
  mountedHost?.remove();
  mountedHost = null;
  vi.unstubAllGlobals();
});

describe("Grid data plugins", () => {
  test("client pagination narrows rendered grid items and preserves source indices", () => {
    const markup = renderCards([gridPagination({ pageIndex: 1, pageSize: 1 })]);

    expect(markup).not.toContain(">alpha<");
    expect(markup).toContain(">beta<");
    expect(markup).not.toContain(">gamma<");
    expect(markup).toContain('data-rmg-idx="1"');
  });

  test("server pagination leaves the supplied grid window untouched", () => {
    const markup = renderCards([
      gridPagination({
        mode: "server",
        pageIndex: 2,
        pageSize: 1,
        total: 12,
      }),
    ]);

    expect(markup).toContain(">alpha<");
    expect(markup).toContain(">beta<");
    expect(markup).toContain(">gamma<");
  });

  test("syncs pagination state with the page query string", async () => {
    window.history.replaceState(null, "", "/demos?demo=grid-pagination");

    function PaginationUrlProbe() {
      const pagination = useGridPagination({
        pageSize: 6,
        total: 18,
        loading: false,
        urlSync: { param: "page" },
      });

      return (
        <button
          type="button"
          data-page-index={pagination.pageIndex}
          data-page-href={pagination.getPageHref?.(2)}
          onClick={() => pagination.setPageIndex(2)}
        >
          {pagination.pageIndex}
        </button>
      );
    }

    const host = mount(<PaginationUrlProbe />);
    await React.act(async () => {});

    const button = host.querySelector<HTMLButtonElement>("button")!;
    expect(button.dataset.pageIndex).toBe("0");
    expect(button.dataset.pageHref).toBe("/demos?demo=grid-pagination&page=3");

    await React.act(async () => {
      button.click();
    });

    expect(window.location.search).toBe("?demo=grid-pagination&page=3");
  });

  test("restores pagination page and page size from sessionStorage", async () => {
    window.sessionStorage.setItem(
      "grid-products-pagination",
      JSON.stringify({ pageIndex: 2, pageSize: 12 }),
    );

    function PaginationStorageProbe() {
      const pagination = useGridPagination({
        initialPageSize: 6,
        total: 60,
        sessionStorage: { key: "grid-products-pagination" },
      });

      return (
        <button
          type="button"
          data-page-index={pagination.pageIndex}
          data-page-size={pagination.pageSize}
          data-offset={pagination.offset}
          onClick={() => pagination.setPageSize(24)}
        >
          update
        </button>
      );
    }

    const host = mount(<PaginationStorageProbe />);
    await React.act(async () => {});

    const button = host.querySelector<HTMLButtonElement>("button")!;
    expect(button.dataset.pageIndex).toBe("2");
    expect(button.dataset.pageSize).toBe("12");
    expect(button.dataset.offset).toBe("24");

    await React.act(async () => {
      button.click();
    });

    expect(button.dataset.pageIndex).toBe("0");
    expect(button.dataset.pageSize).toBe("24");
    expect(window.sessionStorage.getItem("grid-products-pagination")).toBe(
      JSON.stringify({ pageIndex: 0, pageSize: 24 }),
    );
  });

  test("renders shared items-per-page controls", async () => {
    const onItemsPerPageChange = vi.fn();
    const host = mount(
      <GridPaginationControls
        pageIndex={0}
        pageCount={4}
        pageSize={6}
        itemsPerPageOptions={[6, { value: 12, label: "12 items" }]}
        onItemsPerPageChange={onItemsPerPageChange}
        onPageChange={() => undefined}
      />,
    );

    const trigger = host.querySelector<HTMLButtonElement>(
      '[data-rmg-items-per-page-trigger="true"]',
    )!;
    expect(trigger.textContent).toBe("6");
    expect(host.querySelector('[data-rmg-page-items="true"]')).not.toBeNull();

    await React.act(async () => {
      trigger.click();
    });

    const options = Array.from(
      host.querySelectorAll<HTMLButtonElement>(
        '[data-rmg-items-per-page-option="true"]',
      ),
    );
    expect(options[1]?.textContent).toBe("12 items");
    expect(
      host
        .querySelector('[data-rmg-items-per-page-menu="true"]')
        ?.getAttribute("data-state"),
    ).toBe("open");

    await React.act(async () => {
      options[1]?.click();
    });

    expect(onItemsPerPageChange).toHaveBeenCalledWith(12);
  });

  test("ignores selected shared pagination button clicks", async () => {
    const onPageChange = vi.fn();
    const host = mount(
      <GridPaginationControls
        pageIndex={1}
        pageCount={3}
        onPageChange={onPageChange}
      />,
    );

    const selectedPage = host.querySelector<HTMLButtonElement>(
      '[aria-current="page"]',
    )!;
    expect(selectedPage.disabled).toBe(false);

    await React.act(async () => {
      selectedPage.click();
    });

    expect(onPageChange).not.toHaveBeenCalled();
  });

  test("marks shared pagination links as local controls for route progress", () => {
    const markup = renderToStaticMarkup(
      <GridPaginationControls
        pageIndex={1}
        pageCount={3}
        onPageChange={() => undefined}
        getPageHref={(pageIndex) =>
          `/demos?demo=grid-pagination&page=${pageIndex + 1}`
        }
      />,
    );

    expect(markup).toContain("<a");
    expect(markup).toContain('href="/demos?demo=grid-pagination&amp;page=2"');
    expect(markup).toContain('data-disable-progress="true"');
    expect(markup).toContain('data-prevent-progress="true"');
  });

  test("renders click-position ripples on shared pagination buttons", async () => {
    const onPageChange = vi.fn();
    const host = mount(
      <GridPaginationControls
        pageIndex={0}
        pageCount={4}
        onPageChange={onPageChange}
        ripple={{
          color: "#123456",
          duration: "420ms",
          easing: "linear",
          opacity: 0.4,
        }}
      />,
    );

    const nextControl = host.querySelector<HTMLButtonElement>(
      '[data-rmg-page-control="next"]',
    )!;
    nextControl.getBoundingClientRect = () =>
      ({
        width: 80,
        height: 40,
        left: 12,
        top: 14,
        right: 92,
        bottom: 54,
        x: 12,
        y: 14,
        toJSON: () => undefined,
      }) as DOMRect;

    await React.act(async () => {
      nextControl.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: 40,
          clientY: 34,
          detail: 1,
        }),
      );
    });
    expect(onPageChange).toHaveBeenLastCalledWith(1);

    const nextLayer = nextControl.querySelector<HTMLElement>(
      '[data-rmg-page-ripple-layer="true"]',
    )!;
    const nextRipple = nextLayer.querySelector<HTMLElement>(
      '[data-rmg-page-ripple="true"]',
    )!;
    expect(nextLayer.parentElement).toBe(nextControl);
    expect(nextLayer.style.position).toBe("absolute");
    expect(nextLayer.style.overflow).toBe("hidden");
    expect(nextLayer.style.borderRadius).toBe("inherit");
    expect(nextRipple).toBeTruthy();
    expect(nextRipple.style.left).toBe("-52px");
    expect(nextRipple.style.top).toBe("-60px");
    expect(nextRipple.style.width).toBe("160px");
    expect(nextRipple.style.height).toBe("160px");

    const pageButton = host.querySelector<HTMLButtonElement>(
      '[data-page-index="2"]',
    )!;
    pageButton.getBoundingClientRect = () =>
      ({
        width: 88,
        height: 44,
        left: 20,
        top: 30,
        right: 108,
        bottom: 74,
        x: 20,
        y: 30,
        toJSON: () => undefined,
      }) as DOMRect;

    await React.act(async () => {
      pageButton.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: 64,
          clientY: 52,
          detail: 1,
        }),
      );
    });

    expect(onPageChange).toHaveBeenLastCalledWith(2);

    const pageLayer = pageButton.querySelector<HTMLElement>(
      '[data-rmg-page-ripple-layer="true"]',
    )!;
    const pageRipples = pageLayer.querySelectorAll<HTMLElement>(
      '[data-rmg-page-ripple="true"]',
    );
    const ripple = pageRipples[pageRipples.length - 1]!;
    expect(pageLayer.parentElement).toBe(pageButton);
    expect(pageLayer.style.position).toBe("absolute");
    expect(pageLayer.style.overflow).toBe("hidden");
    expect(pageLayer.style.borderRadius).toBe("inherit");
    expect(ripple).toBeTruthy();
    expect(ripple.style.left).toBe("-44px");
    expect(ripple.style.top).toBe("-66px");
    expect(ripple.style.width).toBe("176px");
    expect(ripple.style.height).toBe("176px");
    expect(ripple.style.backgroundColor).toBe("rgb(18, 52, 86)");
    expect(ripple.style.opacity).toBe("0.4");
    expect(ripple.style.animation).toContain("420ms linear");
  });

  test("keeps shared pagination ripple hosted when controls become disabled after click", async () => {
    function DisableAfterClickProbe() {
      const [disabled, setDisabled] = React.useState(false);

      return (
        <GridPaginationControls
          pageIndex={0}
          pageCount={3}
          disabled={disabled}
          onPageChange={() => setDisabled(true)}
        />
      );
    }

    const host = mount(<DisableAfterClickProbe />);
    const nextControl = host.querySelector<HTMLButtonElement>(
      '[data-rmg-page-control="next"]',
    )!;
    nextControl.getBoundingClientRect = () =>
      ({
        width: 80,
        height: 40,
        left: 12,
        top: 14,
        right: 92,
        bottom: 54,
        x: 12,
        y: 14,
        toJSON: () => undefined,
      }) as DOMRect;

    await React.act(async () => {
      nextControl.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: 40,
          clientY: 34,
          detail: 1,
        }),
      );
    });

    const disabledNextControl = host.querySelector<HTMLButtonElement>(
      '[data-rmg-page-control="next"]',
    )!;
    expect(disabledNextControl.disabled).toBe(true);
    expect(
      disabledNextControl.querySelector('[data-rmg-page-ripple-layer="true"]'),
    ).toBeTruthy();
  });

  test("keeps shared pagination ripple under the click point when the range recenters", async () => {
    function RecenterProbe() {
      const [pageIndex, setPageIndex] = React.useState(4);

      return (
        <GridPaginationControls
          pageIndex={pageIndex}
          pageCount={30}
          onPageChange={setPageIndex}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
        />
      );
    }

    const originalGetBoundingClientRect =
      HTMLElement.prototype.getBoundingClientRect;
    const rectFor = (left: number) =>
      ({
        width: 44,
        height: 40,
        left,
        top: 60,
        right: left + 44,
        bottom: 100,
        x: left,
        y: 60,
        toJSON: () => undefined,
      }) as DOMRect;

    HTMLElement.prototype.getBoundingClientRect = function () {
      const element = this as HTMLElement;

      if (element.dataset.pageIndex === "5") {
        return element.dataset.selected === "true"
          ? rectFor(260)
          : rectFor(320);
      }

      if (element.dataset.pageIndex === "6") {
        return rectFor(320);
      }

      return originalGetBoundingClientRect.call(this);
    };

    const host = mount(<RecenterProbe />);
    const pageButton = host.querySelector<HTMLButtonElement>(
      '[data-page-index="5"]',
    )!;

    try {
      await React.act(async () => {
        pageButton.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            clientX: 342,
            clientY: 80,
            detail: 1,
          }),
        );
      });

      expect(
        host
          .querySelector('[data-page-index="5"]')
          ?.getAttribute("data-selected"),
      ).toBe("true");

      const selectedButton = host.querySelector<HTMLButtonElement>(
        '[data-page-index="5"]',
      )!;
      const buttonUnderClick = host.querySelector<HTMLButtonElement>(
        '[data-page-index="6"]',
      )!;
      const layer = buttonUnderClick.querySelector<HTMLElement>(
        '[data-rmg-page-ripple-layer="true"]',
      )!;
      const ripple = layer.querySelector<HTMLElement>(
        '[data-rmg-page-ripple="true"]',
      )!;
      expect(
        selectedButton.querySelector('[data-rmg-page-ripple-layer="true"]'),
      ).toBeNull();
      expect(layer.parentElement).toBe(buttonUnderClick);
      expect(layer.style.position).toBe("absolute");
      expect(layer.style.overflow).toBe("hidden");
      expect(ripple.style.left).toBe("-22px");
      expect(ripple.style.top).toBe("-24px");
    } finally {
      HTMLElement.prototype.getBoundingClientRect =
        originalGetBoundingClientRect;
    }
  });

  test("load-more limits rendered grid items", () => {
    const markup = renderCards([gridLoadMore({ visibleCount: 2 })]);

    expect(markup).toContain(">alpha<");
    expect(markup).toContain(">beta<");
    expect(markup).not.toContain(">gamma<");
    expect(markup).toContain('data-rmg-idx="1"');
    expect(markup).not.toContain('data-rmg-idx="2"');
  });

  test("appends keyed children without remounting existing grid items", async () => {
    function AppendProbe() {
      const [items, setItems] = React.useState(["alpha", "beta"]);

      return (
        <>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, "gamma"])}
          >
            Add
          </button>
          <Grid columns={1} gap={8}>
            {items.map((item) => (
              <article key={item}>{item}</article>
            ))}
          </Grid>
        </>
      );
    }

    const host = mount(<AppendProbe />);
    const alpha = host.querySelector("[data-rmg-idx='0']");
    const add = host.querySelector("button")!;

    await React.act(async () => {
      add.click();
    });

    expect(host.querySelector("[data-rmg-idx='0']")).toBe(alpha);
    expect(host.querySelector("[data-rmg-idx='2']")?.textContent).toBe("gamma");
  });

  test("infinite-scroll renders a sentinel after the grid root", () => {
    const host = mount(
      <Grid
        columns={1}
        plugins={[
          gridInfiniteScroll({
            hasMore: true,
            sentinel: <span>Loading more</span>,
          }),
        ]}
      >
        <article>alpha</article>
      </Grid>,
    );

    const shell = host.querySelector("[data-rmg-grid-scope]");
    const root = shell?.querySelector("[data-rmg-grid-node='true']");
    const sentinel = shell?.querySelector("[data-rmg-data-sentinel='grid']");

    expect(root?.nextElementSibling).toBe(sentinel);
    expect(sentinel?.textContent).toBe("Loading more");
  });

  test("infinite-scroll calls onLoadMore once per armed intersection", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const onLoadMore = vi.fn();

    mount(
      <Grid
        columns={1}
        plugins={[
          gridInfiniteScroll({
            hasMore: true,
            loading: false,
            onLoadMore,
          }),
        ]}
      >
        <article>alpha</article>
      </Grid>,
    );
    await React.act(async () => {});

    const observer = MockIntersectionObserver.instances.find(
      (entry) =>
        entry.target instanceof HTMLElement &&
        entry.target.getAttribute("data-rmg-data-sentinel") === "grid",
    );
    expect(observer).toBeDefined();

    React.act(() => {
      observer?.trigger(true);
      observer?.trigger(true);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    React.act(() => {
      observer?.trigger(false);
      observer?.trigger(true);
    });
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  test("infinite-scroll re-arms when the rendered grid window grows", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const onLoadMore = vi.fn();

    function InfiniteProbe() {
      const [visibleCount, setVisibleCount] = React.useState(1);

      return (
        <Grid
          columns={1}
          plugins={[
            gridLoadMore({
              visibleCount,
              total: 3,
              loading: false,
            }),
            gridInfiniteScroll({
              hasMore: visibleCount < 3,
              loading: false,
              onLoadMore: () => {
                onLoadMore();
                setVisibleCount((count) => Math.min(3, count + 1));
              },
            }),
          ]}
        >
          <article>alpha</article>
          <article>beta</article>
          <article>gamma</article>
        </Grid>
      );
    }

    const host = mount(<InfiniteProbe />);
    await React.act(async () => {});
    const getSentinelObserver = () =>
      MockIntersectionObserver.instances
        .slice()
        .reverse()
        .find(
          (entry) =>
            entry.target instanceof HTMLElement &&
            entry.target.getAttribute("data-rmg-data-sentinel") === "grid",
        );

    expect(host.querySelector("[data-rmg-idx='0']")?.textContent).toBe("alpha");
    expect(host.querySelector("[data-rmg-idx='1']")).toBeNull();

    React.act(() => {
      getSentinelObserver()?.trigger(true);
    });
    await React.act(async () => {});

    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(host.querySelector("[data-rmg-idx='1']")?.textContent).toBe("beta");

    React.act(() => {
      getSentinelObserver()?.trigger(true);
    });
    await React.act(async () => {});

    expect(onLoadMore).toHaveBeenCalledTimes(2);
    expect(host.querySelector("[data-rmg-idx='2']")?.textContent).toBe("gamma");
  });

  test("loading data plugins keep the grid busy until loading clears", async () => {
    const render = (loading: boolean) => (
      <Grid
        columns={1}
        plugins={[
          gridPagination({
            pageIndex: 0,
            pageSize: 1,
            loading,
          }),
        ]}
      >
        <article>alpha</article>
      </Grid>
    );

    const host = mount(render(true));
    await React.act(async () => {});
    expect(
      host
        .querySelector("[data-rmg-grid-node='true']")
        ?.getAttribute("aria-busy"),
    ).toBe("true");

    await React.act(async () => {
      mountedRoot?.render(render(false));
      await Promise.resolve();
    });
    expect(
      host
        .querySelector("[data-rmg-grid-node='true']")
        ?.getAttribute("aria-busy"),
    ).toBeNull();
  });

  test("item reveal keeps skeletons visible while grid loading holds reveal inactive", () => {
    const markup = renderToStaticMarkup(
      <Grid
        columns={1}
        loading={{
          active: true,
          skeleton: () => <span>loading card</span>,
        }}
      >
        <article>alpha</article>
      </Grid>,
    );

    expect(markup).toContain('data-rmg-grid-item-stage="1"');
    expect(markup).toContain('data-rmg-grid-item-reveal="0"');
    expect(markup).toContain('data-rmg-grid-item-skeleton="true"');
    expect(markup).toContain(">loading card<");
    expect(markup).not.toContain("revealContainer");
  });

  test("item reveal leaves custom skeleton shimmer timing to CSS", async () => {
    const shimmerDelays: Array<number | undefined> = [];

    const render = (revealKey: string) => (
      <Grid
        columns={1}
        loading={{
          skeleton: (args) => {
            shimmerDelays.push((args as any).shimmerDelayMs);
            return <span>loading card</span>;
          },
        }}
      >
        <article key="slot" data-rmg-grid-reveal-key={revealKey}>
          alpha
        </article>
      </Grid>
    );

    mount(render("placeholder"));
    await React.act(async () => {});
    const initialDelay = shimmerDelays.at(-1);

    await React.act(async () => {
      mountedRoot?.render(render("product"));
      await Promise.resolve();
    });

    expect(shimmerDelays.at(-1)).toBe(initialDelay);
    expect(shimmerDelays.length).toBeGreaterThanOrEqual(2);
    expect(shimmerDelays.every((delay) => delay == null)).toBe(true);
  });

  test("item reveal keeps custom skeleton rendering stable while readiness changes", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const readyArgs: boolean[] = [];
    const render = () => (
      <Grid
        columns={1}
        loading={{
          keepSkeletonMounted: true,
          waitForMedia: false,
          timing: { minVisibleMs: 0 },
          skeleton: ({ ready }) => {
            readyArgs.push(ready);
            return (
              <span data-grid-skeleton-card data-ready={String(ready)}>
                loading card
              </span>
            );
          },
        }}
      >
        <article data-rmg-grid-reveal-key="product-a">alpha</article>
      </Grid>
    );

    const host = mount(render());
    await flushItemReveal();

    const skeletonCard = host.querySelector("[data-grid-skeleton-card]");
    expect(skeletonCard).not.toBeNull();
    const callCountBeforeReveal = readyArgs.length;

    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    expect(
      host.querySelector("[data-rmg-grid-item-reveal='1']"),
    ).not.toBeNull();
    expect(host.querySelector("[data-grid-skeleton-card]")).toBe(skeletonCard);
    expect(readyArgs.length).toBe(callCountBeforeReveal);
    expect(readyArgs.every((ready) => ready === false)).toBe(true);
  });

  test("item reveal keeps offscreen skeletons mounted until their item enters view", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const host = mount(
      <Grid
        columns={1}
        loading={{
          waitForMedia: false,
          timing: { minVisibleMs: 0, exitMs: 500 },
          skeleton: ({ index }) => (
            <span data-grid-skeleton-card={index}>loading {index}</span>
          ),
        }}
      >
        <article data-rmg-grid-reveal-key="product-a">alpha</article>
        <article data-rmg-grid-reveal-key="product-b">beta</article>
      </Grid>,
    );
    await flushItemReveal();

    const first = host.querySelector<HTMLElement>("[data-rmg-idx='0']");
    const second = host.querySelector<HTMLElement>("[data-rmg-idx='1']");
    expect(first?.getAttribute("data-rmg-grid-item-reveal")).toBe("0");
    expect(second?.getAttribute("data-rmg-grid-item-reveal")).toBe("0");
    expect(second?.querySelector("[data-rmg-grid-item-skeleton]")).not.toBeNull();
    expect(second?.textContent).toContain("loading 1");

    const firstObserver = MockIntersectionObserver.instances.find(
      (observer) => observer.target === first,
    );
    await React.act(async () => {
      firstObserver?.trigger(true);
    });
    await flushItemReveal();

    expect(first?.getAttribute("data-rmg-grid-item-reveal")).toBe("1");
    expect(second?.getAttribute("data-rmg-grid-item-reveal")).toBe("0");
    expect(second?.querySelector("[data-rmg-grid-item-skeleton]")).not.toBeNull();

    const secondObserver = MockIntersectionObserver.instances.find(
      (observer) => observer.target === second,
    );
    await React.act(async () => {
      secondObserver?.trigger(true);
    });
    await flushItemReveal();

    expect(second?.getAttribute("data-rmg-grid-item-reveal")).toBe("1");
  });

  test("item reveal applies custom skeleton enter and exit durations", () => {
    const markup = renderToStaticMarkup(
      <Grid
        columns={1}
        loading={{
          active: true,
          timing: { enterMs: 120, exitMs: 360 },
          skeleton: () => <span>loading card</span>,
        }}
      >
        <article>alpha</article>
      </Grid>,
    );

    expect(markup).toContain("--rmg-grid-item-skeleton-enter-duration:120ms");
    expect(markup).toContain("--rmg-grid-item-skeleton-exit-duration:360ms");
  });

  test("item reveal remounts forced loading skeletons over revealed grid items", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const render = (loading: boolean) => (
      <Grid
        columns={1}
        loading={{
          active: loading,
          force: {
            enabled: true,
            showContent: true,
            skeletonOpacity: 0.5,
          },
          waitForMedia: false,
          timing: { minVisibleMs: 0 },
          skeleton: () => <span>loading card</span>,
        }}
      >
        <article data-rmg-grid-reveal-key="product-a">alpha</article>
      </Grid>
    );

    const host = mount(render(false));
    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    expect(
      host.querySelector("[data-rmg-grid-item-reveal='1']"),
    ).not.toBeNull();
    expect(host.querySelector("[data-rmg-grid-item-skeleton]")).not.toBeNull();

    await React.act(async () => {
      mountedRoot?.render(render(true));
      await Promise.resolve();
    });

    const compareItem = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-compare='1']",
    );
    expect(compareItem).not.toBeNull();
    const compareSkeleton = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    expect(
      compareSkeleton?.style.getPropertyValue(
        "--rmg-grid-item-skeleton-opacity",
      ),
    ).toBe("0.5");

    await React.act(async () => {
      mountedRoot?.render(render(false));
      await Promise.resolve();
    });

    const exitingSkeleton = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    expect(exitingSkeleton).not.toBeNull();

    await React.act(async () => {
      const event = new Event("transitionend", { bubbles: true });
      Object.defineProperty(event, "propertyName", { value: "opacity" });
      exitingSkeleton?.dispatchEvent(event);
    });

    expect(host.querySelector("[data-rmg-grid-item-skeleton]")).toBeNull();
  });

  test("item reveal can keep settled skeleton layers mounted for page-transition fade-ins", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const render = (loading: boolean) => (
      <Grid
        columns={1}
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
        <article data-rmg-grid-reveal-key="product-a">alpha</article>
      </Grid>
    );

    const host = mount(render(false));
    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    const exitingSkeleton = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    expect(exitingSkeleton).not.toBeNull();

    await React.act(async () => {
      const event = new Event("transitionend", { bubbles: true });
      Object.defineProperty(event, "propertyName", { value: "opacity" });
      exitingSkeleton?.dispatchEvent(event);
    });

    const settledSkeleton = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    expect(settledSkeleton).toBe(exitingSkeleton);
    expect(settledSkeleton?.getAttribute("data-rmg-grid-item-shimmer")).toBe(
      "off",
    );

    await React.act(async () => {
      mountedRoot?.render(render(true));
      await Promise.resolve();
    });

    const compareSkeleton = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    expect(compareSkeleton).toBe(settledSkeleton);
    expect(compareSkeleton?.getAttribute("data-rmg-grid-item-shimmer")).toBeNull();
    expect(
      host.querySelector("[data-rmg-grid-item-compare='1']"),
    ).not.toBeNull();
    expect(
      compareSkeleton?.style.getPropertyValue(
        "--rmg-grid-item-skeleton-opacity",
      ),
    ).toBe("0.5");
    expect(
      compareSkeleton?.style.getPropertyValue(
        "--rmg-grid-item-skeleton-enter-duration",
      ),
    ).toBe("180ms");
    expect(
      compareSkeleton?.style.getPropertyValue(
        "--rmg-grid-item-skeleton-exit-duration",
      ),
    ).toBe("420ms");
  });

  test("structured grid skeletons stay mounted as inner layout anchors after reveal", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const skeleton: GridSkeletonSpec = {
      shimmer: {
        durationMs: 1550,
      },
      layout: {
        kind: "grid",
        item: {
          kind: "col",
          style: { gap: 10 },
          children: [
            {
              kind: "rect",
              style: { width: "100%", aspectRatio: "4 / 5" },
            },
            {
              kind: "text",
              barHeight: 14,
              lineHeight: 1.5,
              lines: 2,
            },
          ],
        },
      },
    };

    const host = mount(
      <Grid
        columns={1}
        loading={{
          waitForMedia: false,
          timing: { minVisibleMs: 0, exitMs: 240 },
          skeleton,
        }}
      >
        <article data-rmg-grid-reveal-key="product-a">
          <div style={{ height: 1 }}>alpha</div>
        </article>
      </Grid>,
    );

    await flushItemReveal();

    const item = host.querySelector<HTMLElement>(
      "[data-rmg-grid-node='true'] [data-rmg-grid-item-key]",
    );
    const skeletonLayer = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    expect(item).not.toBeNull();
    expect(skeletonLayer).not.toBeNull();
    expect(host.querySelector("[data-rmg-skeleton-wrapper]")).toBeNull();
    expect(item?.getAttribute("data-rmg-grid-item-layered")).toBe("1");
    expect(
      Array.from(host.querySelectorAll("style"))
        .map((node) => node.textContent ?? "")
        .join("\n"),
    ).not.toContain("--rmg-grid-item-seed-height");
    expect(item?.getAttribute("data-rmg-grid-item-layout-seed")).toBeNull();
    expect(skeletonLayer?.getAttribute("data-rmg-grid-item-shimmer")).toBeNull();
    expect(skeletonLayer?.innerHTML).toContain(sharedSkeletonStyles.skelCardShimmer);
    expect(
      skeletonLayer
        ?.querySelector<HTMLElement>("[data-rmg-grid-skel-scope]")
        ?.style.getPropertyValue("--rmg-skel-shimmer-duration"),
    ).toBe("1550ms");

    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    expect(item?.getAttribute("data-rmg-grid-item-reveal")).toBe("1");
    expect(host.querySelector("[data-rmg-grid-item-skeleton]")).toBe(skeletonLayer);
    expect(skeletonLayer?.getAttribute("data-rmg-grid-item-shimmer")).toBeNull();

    await React.act(async () => {
      const event = new Event("transitionend", { bubbles: true });
      Object.defineProperty(event, "propertyName", { value: "opacity" });
      skeletonLayer?.dispatchEvent(event);
    });

    const settledSkeleton = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    expect(settledSkeleton).toBe(skeletonLayer);
    expect(item?.getAttribute("data-rmg-grid-item-layered")).toBe("1");
    expect(item?.getAttribute("data-rmg-grid-item-layout-seed")).toBeNull();
    expect(item?.getAttribute("data-rmg-grid-item-reveal-settled")).toBe("1");
    expect(settledSkeleton?.getAttribute("data-rmg-grid-item-shimmer")).toBe("off");
    expect(
      item?.querySelector("[data-rmg-grid-item-content='true']"),
    ).not.toBeNull();
  });

  test("structured grid skeleton slot scopes stay stable when reveal keys change and items append", async () => {
    const skeleton: GridSkeletonSpec = {
      shimmer: {
        durationMs: 1200,
      },
      layout: {
        kind: "grid",
        item: {
          kind: "col",
          style: { gap: 10 },
          children: [
            {
              kind: "rect",
              style: { width: "100%", aspectRatio: "4 / 5" },
            },
            {
              kind: "text",
              barHeight: 14,
              lineHeight: 1.5,
              lines: 2,
            },
          ],
        },
      },
    };

    const render = (count: number, ready = false) => (
      <Grid
        columns={1}
        loading={{
          keepSkeletonMounted: true,
          waitForMedia: false,
          timing: { minVisibleMs: 0 },
          skeleton,
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <article
            key={`slot-${index}`}
            data-rmg-grid-reveal-key={
              ready ? `product-${index}` : `slot-${index}`
            }
          >
            product {index}
          </article>
        ))}
      </Grid>
    );

    const host = mount(render(2));
    const firstSkeletonLayer = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    const firstSlotScope = firstSkeletonLayer?.querySelector<HTMLElement>(
      "[data-rmg-grid-skel-scope]",
    );
    const firstScopeId = firstSlotScope?.getAttribute("data-rmg-grid-skel-scope");

    expect(firstSkeletonLayer).not.toBeNull();
    expect(firstSlotScope).not.toBeNull();
    expect(firstScopeId).toBeTruthy();

    await React.act(async () => {
      mountedRoot?.render(render(2, true));
      await Promise.resolve();
    });

    const readyFirstSkeletonLayer = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    const readyFirstSlotScope = readyFirstSkeletonLayer?.querySelector<HTMLElement>(
      "[data-rmg-grid-skel-scope]",
    );

    expect(readyFirstSkeletonLayer).toBe(firstSkeletonLayer);
    expect(readyFirstSlotScope).toBe(firstSlotScope);
    expect(readyFirstSlotScope?.getAttribute("data-rmg-grid-skel-scope")).toBe(
      firstScopeId,
    );

    await React.act(async () => {
      mountedRoot?.render(render(3, true));
      await Promise.resolve();
    });

    const nextFirstSkeletonLayer = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    const nextFirstSlotScope = nextFirstSkeletonLayer?.querySelector<HTMLElement>(
      "[data-rmg-grid-skel-scope]",
    );

    expect(nextFirstSkeletonLayer).toBe(firstSkeletonLayer);
    expect(nextFirstSlotScope).toBe(firstSlotScope);
    expect(nextFirstSlotScope?.getAttribute("data-rmg-grid-skel-scope")).toBe(
      firstScopeId,
    );
  });

  test("item reveal settles immediately when there is no item skeleton", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const host = mount(
      <Grid
        columns={1}
        loading={{
          waitForMedia: false,
          timing: { minVisibleMs: 0, exitMs: 240 },
        }}
      >
        <article data-rmg-grid-reveal-key="product-a">alpha</article>
      </Grid>,
    );

    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    const item = host.querySelector<HTMLElement>("[data-rmg-grid-item-key]");
    expect(item?.getAttribute("data-rmg-grid-item-reveal")).toBe("1");
    expect(item?.getAttribute("data-rmg-grid-item-reveal-settled")).toBe("1");
    expect(host.querySelector("[data-rmg-grid-item-skeleton]")).toBeNull();
  });

  test("item reveal settles immediately when the item skeleton exit is disabled", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const host = mount(
      <Grid
        columns={1}
        loading={{
          waitForMedia: false,
          timing: { minVisibleMs: 0, exitMs: 0 },
          skeleton: ({ revealKey }) => <span>loading {String(revealKey)}</span>,
        }}
      >
        <article data-rmg-grid-reveal-key="product-a">alpha</article>
      </Grid>,
    );

    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    const item = host.querySelector<HTMLElement>("[data-rmg-grid-item-key]");
    expect(item?.getAttribute("data-rmg-grid-item-reveal")).toBe("1");
    expect(item?.getAttribute("data-rmg-grid-item-reveal-settled")).toBe("1");
    expect(host.querySelector("[data-rmg-grid-item-skeleton]")).toBeNull();
  });

  test("item reveal keeps a stable slot skeleton layer when the reveal key changes", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const revealStatesAtContentCommit: Array<string | null> = [];
    function RevealCommitProbe({ label }: { label: string }) {
      const ref = React.useCallback((node: HTMLSpanElement | null) => {
        if (!node) return;

        revealStatesAtContentCommit.push(
          node
            .closest("[data-rmg-grid-item-key]")
            ?.getAttribute("data-rmg-grid-item-reveal") ?? null,
        );
      }, []);

      return <span ref={ref}>{label}</span>;
    }

    const render = (revealKey: string) => (
      <Grid
        columns={1}
        loading={{
          keepSkeletonMounted: true,
          rememberRevealed: false,
          waitForMedia: false,
          timing: { minVisibleMs: 0 },
          skeleton: ({ revealKey }) => <span>loading {String(revealKey)}</span>,
        }}
      >
        <article key="slot" data-rmg-grid-reveal-key={revealKey}>
          <RevealCommitProbe label={revealKey} />
        </article>
      </Grid>
    );

    const host = mount(render("product-a"));
    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    const settledSkeleton = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    const settledContent = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-content]",
    );
    expect(settledSkeleton).not.toBeNull();
    expect(settledContent).not.toBeNull();

    await React.act(async () => {
      const event = new Event("transitionend", { bubbles: true });
      Object.defineProperty(event, "propertyName", { value: "opacity" });
      settledSkeleton?.dispatchEvent(event);
    });

    await React.act(async () => {
      mountedRoot?.render(render("product-b"));
      await Promise.resolve();
    });

    const nextSkeleton = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-skeleton]",
    );
    const nextContent = host.querySelector<HTMLElement>(
      "[data-rmg-grid-item-content]",
    );
    expect(nextSkeleton).toBe(settledSkeleton);
    expect(nextContent).not.toBe(settledContent);
    expect(
      host.querySelector("[data-rmg-grid-item-reveal='0']"),
    ).not.toBeNull();
    expect(revealStatesAtContentCommit.at(-1)).toBe("0");
    expect(host.textContent).toContain("loading product-b");

    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    expect(
      host.querySelector("[data-rmg-grid-item-reveal='1']"),
    ).not.toBeNull();
  });

  test("item reveal can forget revealed identities after they leave the data window", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const render = (pageIndex: number) => (
      <Grid
        columns={1}
        plugins={[gridPagination({ pageIndex, pageSize: 1 })]}
        loading={{
          rememberRevealed: false,
          waitForMedia: false,
          timing: { minVisibleMs: 0 },
          skeleton: ({ revealKey }) => <span>loading {String(revealKey)}</span>,
        }}
      >
        <article key="slot-a" data-rmg-grid-reveal-key="product-a">
          alpha
        </article>
        <article key="slot-b" data-rmg-grid-reveal-key="product-b">
          beta
        </article>
      </Grid>
    );

    const host = mount(render(0));
    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    expect(
      host.querySelector("[data-rmg-grid-item-reveal='1']"),
    ).not.toBeNull();

    await React.act(async () => {
      mountedRoot?.render(render(1));
      await Promise.resolve();
    });
    await React.act(async () => {
      mountedRoot?.render(render(0));
      await Promise.resolve();
    });

    expect(host.textContent).toContain("alpha");
    expect(
      host.querySelector("[data-rmg-grid-item-reveal='0']"),
    ).not.toBeNull();
    expect(host.textContent).toContain("loading product-a");
  });

  test("server pagination revisits cached pages through the reveal queue", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const render = (pageIndex: number, revealKey: string) => (
      <Grid
        columns={1}
        plugins={[
          gridPagination({
            mode: "server",
            pageIndex,
            pageSize: 1,
            total: 2,
          }),
        ]}
        loading={{
          waitForMedia: false,
          timing: { minVisibleMs: 0 },
          skeleton: ({ revealKey }) => <span>loading {String(revealKey)}</span>,
        }}
      >
        <article key={revealKey} data-rmg-grid-reveal-key={revealKey}>
          {revealKey}
        </article>
      </Grid>
    );

    const host = mount(render(0, "product-a"));
    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    expect(
      host.querySelector("[data-rmg-grid-item-reveal='1']"),
    ).not.toBeNull();

    await React.act(async () => {
      mountedRoot?.render(render(1, "product-b"));
      await Promise.resolve();
    });
    await React.act(async () => {
      mountedRoot?.render(render(0, "product-a"));
      await Promise.resolve();
    });

    expect(host.textContent).toContain("product-a");
    expect(
      host.querySelector("[data-rmg-grid-item-reveal='0']"),
    ).not.toBeNull();
    expect(host.textContent).toContain("loading product-a");

    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    expect(
      host.querySelector("[data-rmg-grid-item-reveal='1']"),
    ).not.toBeNull();
  });

  test("item reveal remembers revealed identities across remounts", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const render = (pageIndex: number) => (
      <Grid
        columns={1}
        plugins={[gridPagination({ pageIndex, pageSize: 1 })]}
        loading={{
          waitForMedia: false,
          timing: { minVisibleMs: 0 },
          skeleton: ({ revealKey }) => <span>loading {String(revealKey)}</span>,
        }}
      >
        <article key="slot-a" data-rmg-grid-reveal-key="product-a">
          alpha
        </article>
        <article key="slot-b" data-rmg-grid-reveal-key="product-b">
          beta
        </article>
      </Grid>
    );

    const host = mount(render(0));
    await flushItemReveal();
    expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0);
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    expect(
      host.querySelector("[data-rmg-grid-item-reveal='1']"),
    ).not.toBeNull();

    await React.act(async () => {
      mountedRoot?.render(render(1));
    });
    await React.act(async () => {
      mountedRoot?.render(render(0));
    });
    await React.act(async () => {});

    expect(host.textContent).toContain("alpha");
    expect(host.querySelector("[data-rmg-grid-item-skeleton]")).toBeNull();
    expect(
      host.querySelector("[data-rmg-grid-item-reveal-settled='1']"),
    ).not.toBeNull();
  });

  test("item reveal staggers appended items through the reveal queue", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const render = (count: number, loading = false) => (
      <Grid
        columns={1}
        reveal={{ staggerMs: 40, staggerLimit: 6 }}
        loading={{
          active: loading,
          waitForMedia: false,
          timing: { minVisibleMs: 0 },
          skeleton: ({ revealKey }) => <span>loading {String(revealKey)}</span>,
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <article key={index} data-rmg-grid-reveal-key={`product-${index}`}>
            product {index}
          </article>
        ))}
      </Grid>
    );

    const host = mount(render(6));
    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();
    await waitMs(360);
    await flushItemReveal();

    await React.act(async () => {
      mountedRoot?.render(render(6, true));
    });
    MockIntersectionObserver.instances = [];
    await React.act(async () => {
      mountedRoot?.render(render(12));
    });
    await flushItemReveal();
    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        observer.trigger(true);
      });
    });
    await flushItemReveal();

    const getAppendedRevealStates = () =>
      Array.from({ length: 6 }, (_, offset) =>
        host
          .querySelector<HTMLElement>(`[data-rmg-idx="${offset + 6}"]`)
          ?.getAttribute("data-rmg-grid-item-reveal"),
      );

    const earlyRevealedCount = getAppendedRevealStates().filter(
      (state) => state === "1",
    ).length;
    expect(earlyRevealedCount).toBeGreaterThan(0);
    expect(earlyRevealedCount).toBeLessThan(6);

    await waitMs(360);
    await flushItemReveal();

    expect(getAppendedRevealStates()).toEqual(["1", "1", "1", "1", "1", "1"]);
  });

  test("virtualization windows grid rows with spacers", async () => {
    Object.defineProperty(window, "innerHeight", {
      value: 90,
      configurable: true,
    });

    const host = mount(
      <Grid
        columns={1}
        gap={10}
        plugins={[
          gridVirtualization({
            estimateSize: 40,
            gap: 10,
            overscan: 0,
          }),
        ]}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <article key={index}>item {index}</article>
        ))}
      </Grid>,
    );

    await React.act(async () => {});

    expect(host.querySelectorAll("[data-rmg-idx]").length).toBeLessThan(8);
    expect(
      host.querySelector("[data-rmg-grid-virtual-spacer='bottom']"),
    ).not.toBeNull();
  });

  test("virtualization resolves responsive column counts for row windows", async () => {
    Object.defineProperty(window, "innerWidth", {
      value: 900,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 90,
      configurable: true,
    });

    const host = mount(
      <Grid
        columns={{ 0: 1, 640: 2 }}
        gap={10}
        plugins={[
          gridVirtualization({
            estimateSize: 40,
            gap: 10,
            overscan: 0,
          }),
        ]}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <article key={index}>item {index}</article>
        ))}
      </Grid>,
    );

    await React.act(async () => {});

    expect(host.querySelectorAll("[data-rmg-idx]")).toHaveLength(4);
    expect(
      host.querySelector("[data-rmg-grid-virtual-spacer='bottom']"),
    ).not.toBeNull();
  });

  test("fullscreen opens with the preserved source index from a paginated grid", async () => {
    const onOpen = vi.fn();
    const host = mount(
      <GalleryCore layout="grid" fullscreenItems={["/a.jpg", "/b.jpg"]}>
        <GridFullscreenProbe onOpen={onOpen} />
      </GalleryCore>,
    );

    await React.act(async () => {});
    await React.act(async () => {});

    const image = host.querySelector<HTMLImageElement>("img")!;
    expect(image.closest("[data-rmg-idx]")?.getAttribute("data-rmg-idx")).toBe(
      "1",
    );

    React.act(() => {
      image.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 10,
          clientY: 10,
        }),
      );
    });

    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "grid",
        index: 1,
        image,
      }),
    );
  });
});
