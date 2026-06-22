// @vitest-environment jsdom

import * as React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { GalleryCore, useGalleryCore } from "../core";
import { Entries } from ".";
import { EntryList } from "./components/EntryList";
import { entriesLoadMore } from "./plugins/loadMore";
import {
  EntriesPaginationControls,
  entriesPagination,
  getEntriesPageRange,
  useEntriesPagination,
} from "./plugins/pagination";
import { entriesVirtualization } from "./plugins/virtualization";
import { RatingStars } from "../../rating-stars";

const entryVisibilityMock = vi.hoisted(() => ({
  nearView: [true, true, true] as boolean[],
  everInView: [true, true, true] as boolean[],
}));

vi.mock("./hooks/useEntryInView", () => ({
  useEntryInView: () => ({
    nearView: entryVisibilityMock.nearView,
    everInView: entryVisibilityMock.everInView,
    setEntryRef: () => () => undefined,
  }),
}));

vi.mock("../shared/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => false,
}));

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 0),
  );
  vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
    window.clearTimeout(handle),
  );
});

beforeEach(() => {
  entryVisibilityMock.nearView = [true, true, true];
  entryVisibilityMock.everInView = [true, true, true];
});

async function flushAnimationFrames(count: number) {
  await React.act(async () => {
    await new Promise<void>((resolve) => {
      const step = (remaining: number) => {
        if (remaining <= 0) {
          resolve();
          return;
        }

        requestAnimationFrame(() => step(remaining - 1));
      };

      step(count);
    });
  });
}

async function flushMicrotasks() {
  await React.act(async () => {
    await Promise.resolve();
  });
}

async function waitMs(ms: number) {
  await React.act(async () => {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });
  });
}

async function flushEntryRevealFrames() {
  await flushAnimationFrames(2);
  await flushMicrotasks();
  await flushAnimationFrames(2);
  await flushMicrotasks();
  await flushAnimationFrames(2);
}

describe("entries UI helpers", () => {
  test("builds a compact page range with margins and breaks", () => {
    expect(
      getEntriesPageRange({
        pageIndex: 9,
        pageCount: 20,
        pageRangeDisplayed: 3,
        marginPagesDisplayed: 1,
      }),
    ).toEqual([
      { type: "page", key: "page-0", pageIndex: 0, selected: false },
      { type: "break", key: "break-0-8" },
      { type: "page", key: "page-8", pageIndex: 8, selected: false },
      { type: "page", key: "page-9", pageIndex: 9, selected: true },
      { type: "page", key: "page-10", pageIndex: 10, selected: false },
      { type: "break", key: "break-10-19" },
      { type: "page", key: "page-19", pageIndex: 19, selected: false },
    ]);
  });

  test("renders controlled pagination buttons", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const onPageChange = vi.fn();

    await React.act(async () => {
      root.render(
        <EntriesPaginationControls
          pageIndex={2}
          pageCount={6}
          onPageChange={onPageChange}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
        />,
      );
    });

    expect(rootEl.querySelector('[aria-current="page"]')?.textContent).toBe(
      "3",
    );
    const selectedPage = rootEl.querySelector<HTMLButtonElement>(
      '[aria-current="page"]',
    )!;
    expect(selectedPage.disabled).toBe(false);

    await React.act(async () => {
      selectedPage.click();
    });
    expect(onPageChange).not.toHaveBeenCalled();

    await React.act(async () => {
      rootEl
        .querySelector<HTMLButtonElement>('[data-rmg-page-control="next"]')
        ?.click();
    });
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    await React.act(async () => {
      rootEl.querySelector<HTMLButtonElement>('[data-page-index="0"]')?.click();
    });
    expect(onPageChange).toHaveBeenLastCalledWith(0);

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("renders click-position ripples on pagination buttons", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const onPageChange = vi.fn();

    await React.act(async () => {
      root.render(
        <EntriesPaginationControls
          pageIndex={0}
          pageCount={4}
          onPageChange={onPageChange}
          ripple={{
            color: "rgb(1, 2, 3)",
            duration: 900,
            easing: "ease-out",
            opacity: 0.5,
            className: "custom-ripple",
          }}
        />,
      );
    });

    const nextControl = rootEl.querySelector<HTMLButtonElement>(
      '[data-rmg-page-control="next"]',
    )!;
    nextControl.getBoundingClientRect = () =>
      ({
        width: 90,
        height: 42,
        left: 5,
        top: 8,
        right: 95,
        bottom: 50,
        x: 5,
        y: 8,
        toJSON: () => undefined,
      }) as DOMRect;

    await React.act(async () => {
      nextControl.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: 50,
          clientY: 20,
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
    expect(nextRipple.className).toBe("custom-ripple");
    expect(nextRipple.style.left).toBe("-45px");
    expect(nextRipple.style.top).toBe("-78px");
    expect(nextRipple.style.width).toBe("180px");
    expect(nextRipple.style.height).toBe("180px");

    const pageButton = rootEl.querySelector<HTMLButtonElement>(
      '[data-page-index="2"]',
    )!;
    pageButton.getBoundingClientRect = () =>
      ({
        width: 100,
        height: 40,
        left: 10,
        top: 20,
        right: 110,
        bottom: 60,
        x: 10,
        y: 20,
        toJSON: () => undefined,
      }) as DOMRect;

    await React.act(async () => {
      pageButton.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: 35,
          clientY: 45,
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
    expect(ripple.className).toBe("custom-ripple");
    expect(ripple.style.left).toBe("-75px");
    expect(ripple.style.top).toBe("-75px");
    expect(ripple.style.width).toBe("200px");
    expect(ripple.style.height).toBe("200px");
    expect(ripple.style.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(ripple.style.opacity).toBe("0.5");
    expect(ripple.style.animation).toContain("900ms ease-out");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("keeps pagination ripple hosted when controls become disabled after click", async () => {
    function DisableAfterClickProbe() {
      const [disabled, setDisabled] = React.useState(false);

      return (
        <EntriesPaginationControls
          pageIndex={0}
          pageCount={3}
          disabled={disabled}
          onPageChange={() => setDisabled(true)}
        />
      );
    }

    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    await React.act(async () => {
      root.render(<DisableAfterClickProbe />);
    });

    const nextControl = rootEl.querySelector<HTMLButtonElement>(
      '[data-rmg-page-control="next"]',
    )!;
    nextControl.getBoundingClientRect = () =>
      ({
        width: 90,
        height: 42,
        left: 5,
        top: 8,
        right: 95,
        bottom: 50,
        x: 5,
        y: 8,
        toJSON: () => undefined,
      }) as DOMRect;

    await React.act(async () => {
      nextControl.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: 50,
          clientY: 20,
          detail: 1,
        }),
      );
    });

    const disabledNextControl = rootEl.querySelector<HTMLButtonElement>(
      '[data-rmg-page-control="next"]',
    )!;
    expect(disabledNextControl.disabled).toBe(true);
    expect(
      disabledNextControl.querySelector('[data-rmg-page-ripple-layer="true"]'),
    ).toBeTruthy();

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("keeps pagination ripple under the click point when the range recenters", async () => {
    function RecenterProbe() {
      const [pageIndex, setPageIndex] = React.useState(4);

      return (
        <EntriesPaginationControls
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

    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    try {
      await React.act(async () => {
        root.render(<RecenterProbe />);
      });

      const pageButton = rootEl.querySelector<HTMLButtonElement>(
        '[data-page-index="5"]',
      )!;

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
        rootEl
          .querySelector('[data-page-index="5"]')
          ?.getAttribute("data-selected"),
      ).toBe("true");

      const selectedButton = rootEl.querySelector<HTMLButtonElement>(
        '[data-page-index="5"]',
      )!;
      const buttonUnderClick = rootEl.querySelector<HTMLButtonElement>(
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

      await React.act(async () => {
        root.unmount();
      });
      rootEl.remove();
    }
  });

  test("renders pagination links when page hrefs are provided", () => {
    const markup = renderToStaticMarkup(
      <EntriesPaginationControls
        pageIndex={1}
        pageCount={3}
        onPageChange={() => undefined}
        getPageHref={(pageIndex) =>
          pageIndex === 0
            ? "/demos?demo=entries-pagination"
            : `/demos?demo=entries-pagination&page=${pageIndex + 1}`
        }
      />,
    );

    expect(markup).toContain("<a");
    expect(markup).toContain(
      'href="/demos?demo=entries-pagination&amp;page=2"',
    );
    expect(markup).toContain('data-disable-progress="true"');
    expect(markup).toContain('data-prevent-progress="true"');
    expect(markup).toContain('aria-current="page"');
  });

  test("syncs pagination state with the page query string", async () => {
    window.history.replaceState(
      null,
      "",
      "/demos?demo=entries-pagination&page=2",
    );

    function PaginationUrlProbe() {
      const pagination = useEntriesPagination({
        mode: "server",
        pageSize: 6,
        total: 30,
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

    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    await React.act(async () => {
      root.render(<PaginationUrlProbe />);
    });

    const button = rootEl.querySelector<HTMLButtonElement>("button")!;
    expect(button.dataset.pageIndex).toBe("1");
    expect(button.dataset.pageHref).toBe(
      "/demos?demo=entries-pagination&page=3",
    );

    await React.act(async () => {
      button.click();
    });

    expect(window.location.search).toBe("?demo=entries-pagination&page=3");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("keeps url-synced pagination controls hydration safe", async () => {
    window.history.replaceState(null, "", "/demos?demo=entries-pagination");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    function PaginationHydrationProbe() {
      const pagination = useEntriesPagination({
        mode: "server",
        pageSize: 6,
        total: 18,
        loading: false,
        urlSync: { param: "page" },
      });

      return (
        <EntriesPaginationControls
          pageIndex={pagination.pageIndex}
          pageCount={pagination.pageCount}
          onPageChange={pagination.setPageIndex}
          getPageHref={pagination.getPageHref}
        />
      );
    }

    const markup = renderToString(<PaginationHydrationProbe />);
    expect(markup).toContain("<button");
    expect(markup).not.toContain("<a");

    const rootEl = document.createElement("div");
    rootEl.innerHTML = markup;
    document.body.appendChild(rootEl);
    let root: ReturnType<typeof hydrateRoot> | null = null;

    try {
      await React.act(async () => {
        root = hydrateRoot(rootEl, <PaginationHydrationProbe />);
        await Promise.resolve();
      });

      expect(
        consoleError.mock.calls.some((call) =>
          String(call[0]).includes("Hydration failed"),
        ),
      ).toBe(false);
      expect(
        rootEl.querySelector<HTMLAnchorElement>('[data-page-index="1"]')?.href,
      ).toContain("/demos?demo=entries-pagination&page=2");
    } finally {
      await React.act(async () => {
        root?.unmount();
      });
      rootEl.remove();
      consoleError.mockRestore();
    }
  });

  test("renders rating stars with value and review count", () => {
    const markup = renderToStaticMarkup(
      <RatingStars value={4.6} fillMode="floor" reviewCount={1248} />,
    );

    expect(markup).toContain('data-rmg-rating-stars="true"');
    expect(markup).toContain("4.6");
    expect(markup).toContain("(1,248 reviews)");
    expect(markup.match(/data-state="full"/g)).toHaveLength(4);
    expect(markup.match(/data-state="empty"/g)).toHaveLength(1);
  });
});

function renderEntryList(plugins: any[]) {
  return renderToStaticMarkup(
    <EntryList
      enabled
      entries={{
        items: [
          { id: "entry-0", media: [] },
          { id: "entry-1", media: [] },
          { id: "entry-2", media: [] },
        ],
        loading: { enabled: false },
        plugins,
      }}
      fsEnabled={false}
      openFullscreenAt={() => undefined}
      entryFlatIndex={[]}
      entryFlatIndexRef={React.createRef<number[][] | null>()}
      nodeFromMedia={() => null}
      renderMediaContainer={() => null}
      breakpoints={{}}
    />,
  );
}

function virtualEntries(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `entry-${index}`,
    media: [],
  }));
}

function virtualEntryListNode(args: {
  count?: number;
  layout?: React.ComponentProps<typeof EntryList>["entries"]["layout"];
  plugins: any[];
  entryList?: React.ComponentProps<typeof EntryList>["entries"]["entryList"];
}) {
  const items = virtualEntries(args.count ?? 8);
  entryVisibilityMock.nearView = items.map(() => true);
  entryVisibilityMock.everInView = items.map(() => true);

  return (
    <EntryList
      enabled
      entries={{
        items,
        layout: args.layout,
        loading: { enabled: false },
        plugins: args.plugins,
        entryList: args.entryList,
      }}
      fsEnabled={false}
      openFullscreenAt={() => undefined}
      entryFlatIndex={items.map(() => [])}
      entryFlatIndexRef={React.createRef<number[][] | null>()}
      nodeFromMedia={() => null}
      renderMediaContainer={() => null}
      breakpoints={{}}
    />
  );
}

function mountEntryList(node: React.ReactNode) {
  const rootEl = document.createElement("div");
  document.body.appendChild(rootEl);
  const root = createRoot(rootEl);

  React.act(() => {
    root.render(node);
  });

  return { rootEl, root };
}

function FullscreenRequestProbe({
  onRequest,
}: {
  onRequest: ReturnType<typeof vi.fn>;
}) {
  const core = useGalleryCore();

  React.useEffect(() => core.fsOpenSub.subscribe(onRequest), [core, onRequest]);

  return null;
}

describe("entries data plugins", () => {
  test("client pagination narrows rendered entry rows", () => {
    const markup = renderEntryList([
      entriesPagination({ pageIndex: 1, pageSize: 1 }),
    ]);

    expect(markup).not.toContain('data-rmg-entry-owner="0"');
    expect(markup).toContain('data-rmg-entry-owner="1"');
    expect(markup).not.toContain('data-rmg-entry-owner="2"');
  });

  test("client pagination can reveal revisited pages again", async () => {
    function PaginationRevealProbe() {
      const [pageIndex, setPageIndex] = React.useState(0);
      const items = React.useMemo(
        () => [
          { id: "entry-0", media: [] },
          { id: "entry-1", media: [] },
        ],
        [],
      );

      return (
        <>
          <button type="button" onClick={() => setPageIndex(0)}>
            Page 1
          </button>
          <button type="button" onClick={() => setPageIndex(1)}>
            Page 2
          </button>
          <EntryList
            enabled
            entries={{
              items,
              loading: {
                enabled: true,
                rememberRevealed: false,
                waitForDecode: true,
              },
              reveal: { durationMs: 60, staggerMs: 80 },
              plugins: [entriesPagination({ pageIndex, pageSize: 1 })],
            }}
            fsEnabled={false}
            openFullscreenAt={() => undefined}
            entryFlatIndex={[[], []]}
            entryFlatIndexRef={React.createRef<number[][] | null>()}
            nodeFromMedia={() => null}
            renderMediaContainer={() => null}
            breakpoints={{}}
          />
        </>
      );
    }

    entryVisibilityMock.nearView = [true, true];
    entryVisibilityMock.everInView = [true, true];

    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const row = () => rootEl.querySelector("[data-rmg-entry-owner]");

    await React.act(async () => {
      root.render(<PaginationRevealProbe />);
    });

    expect(row()?.getAttribute("data-rmg-entry-owner")).toBe("0");
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

    await flushEntryRevealFrames();
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");

    await React.act(async () => {
      rootEl.querySelectorAll<HTMLButtonElement>("button")[1]?.click();
    });

    expect(row()?.getAttribute("data-rmg-entry-owner")).toBe("1");
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

    await flushEntryRevealFrames();
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");

    await React.act(async () => {
      rootEl.querySelectorAll<HTMLButtonElement>("button")[0]?.click();
    });

    expect(row()?.getAttribute("data-rmg-entry-owner")).toBe("0");
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

    await flushEntryRevealFrames();
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("server pagination leaves the supplied page untouched", () => {
    const markup = renderEntryList([
      entriesPagination({
        mode: "server",
        pageIndex: 4,
        pageSize: 1,
        total: 12,
      }),
    ]);

    expect(markup).toContain('data-rmg-entry-owner="0"');
    expect(markup).toContain('data-rmg-entry-owner="1"');
    expect(markup).toContain('data-rmg-entry-owner="2"');
  });

  test("server pagination loading masks the current page with an opaque skeleton", () => {
    const markup = renderToStaticMarkup(
      <EntryList
        enabled
        entries={{
          items: [{ id: "entry-0", media: [] }],
          loading: { enabled: true, enterMs: 140, exitMs: 360 },
          plugins: [
            entriesPagination({
              mode: "server",
              pageIndex: 1,
              pageSize: 1,
              total: 3,
              loading: true,
            }),
          ],
        }}
        fsEnabled={false}
        openFullscreenAt={() => undefined}
        entryFlatIndex={[[]]}
        entryFlatIndexRef={React.createRef<number[][] | null>()}
        nodeFromMedia={() => null}
        renderMediaContainer={() => null}
        breakpoints={{}}
      />,
    );

    expect(markup).toContain('data-rmg-entry-mounted="1"');
    expect(markup).toContain('data-rmg-entry-ready="1"');
    expect(markup).toContain('data-rmg-entry-compare="1"');
    expect(markup).toContain("--rmg-entry-skeleton-opacity:1");
    expect(markup).toContain("--rmg-entry-skeleton-enter-duration:140ms");
    expect(markup).toContain("--rmg-entry-skeleton-exit-duration:360ms");
  });

  test("client load-more limits rows by visible count", () => {
    const markup = renderEntryList([entriesLoadMore({ visibleCount: 2 })]);

    expect(markup).toContain('data-rmg-entry-owner="0"');
    expect(markup).toContain('data-rmg-entry-owner="1"');
    expect(markup).not.toContain('data-rmg-entry-owner="2"');
  });

  test("entry layout defaults to list and can switch the list root to grid", () => {
    const listMarkup = renderEntryList([]);
    const gridMarkup = renderToStaticMarkup(
      virtualEntryListNode({ layout: "grid", plugins: [] }),
    );

    expect(listMarkup).toContain('data-rmg-entries-layout="list"');
    expect(gridMarkup).toContain('data-rmg-entries-layout="grid"');
  });

  test("virtualization keeps list row windowing by default", async () => {
    Object.defineProperty(window, "innerHeight", {
      value: 90,
      configurable: true,
    });

    const { rootEl, root } = mountEntryList(
      virtualEntryListNode({
        plugins: [
          entriesVirtualization({
            estimateSize: 40,
            gap: 10,
            overscan: 0,
          }),
        ],
      }),
    );

    await React.act(async () => {});

    expect(rootEl.querySelectorAll("[data-rmg-entry-owner]")).toHaveLength(2);
    expect(
      rootEl.querySelector("[data-rmg-entry-virtual-spacer='bottom']"),
    ).not.toBeNull();

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("virtualization can window entries by grid rows", async () => {
    Object.defineProperty(window, "innerHeight", {
      value: 90,
      configurable: true,
    });

    const { rootEl, root } = mountEntryList(
      virtualEntryListNode({
        plugins: [
          entriesVirtualization({
            layout: "grid",
            estimateSize: 40,
            gap: 10,
            overscan: 0,
          }),
        ],
        entryList: {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          },
        },
      }),
    );

    await React.act(async () => {});

    expect(rootEl.querySelectorAll("[data-rmg-entry-owner]")).toHaveLength(4);
    expect(
      Array.from(rootEl.querySelectorAll("[data-rmg-entry-owner]")).map((row) =>
        row.getAttribute("data-rmg-entry-virtual-row"),
      ),
    ).toEqual(["0", "0", "1", "1"]);
    expect(
      rootEl.querySelector<HTMLElement>(
        "[data-rmg-entry-virtual-spacer='bottom']",
      )?.style.gridColumn,
    ).toBe("1 / -1");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("grid virtualization spacers span columns above and below the window", async () => {
    Object.defineProperty(window, "innerHeight", {
      value: 40,
      configurable: true,
    });
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const isRoot = this.classList.contains("entry-grid-virtual-test");
        const top = isRoot ? -100 : 0;
        const height = isRoot ? 1000 : 40;

        return {
          x: 0,
          y: top,
          width: 400,
          height,
          top,
          bottom: top + height,
          left: 0,
          right: 400,
          toJSON: () => undefined,
        } as DOMRect;
      });

    const { rootEl, root } = mountEntryList(
      virtualEntryListNode({
        plugins: [
          entriesVirtualization({
            layout: "grid",
            estimateSize: 40,
            gap: 10,
            overscan: 0,
          }),
        ],
        entryList: {
          className: "entry-grid-virtual-test",
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          },
        },
      }),
    );

    await React.act(async () => {});

    const topSpacer = rootEl.querySelector<HTMLElement>(
      "[data-rmg-entry-virtual-spacer='top']",
    );
    const bottomSpacer = rootEl.querySelector<HTMLElement>(
      "[data-rmg-entry-virtual-spacer='bottom']",
    );

    expect(rootEl.querySelectorAll("[data-rmg-entry-owner]")).toHaveLength(2);
    expect(topSpacer?.style.gridColumn).toBe("1 / -1");
    expect(bottomSpacer?.style.gridColumn).toBe("1 / -1");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
    rectSpy.mockRestore();
  });

  test("grid virtualization responds to column-count changes", async () => {
    Object.defineProperty(window, "innerHeight", {
      value: 90,
      configurable: true,
    });

    function ResponsiveGridProbe() {
      const [columns, setColumns] = React.useState(1);

      return (
        <>
          <button type="button" onClick={() => setColumns(2)}>
            Two columns
          </button>
          {virtualEntryListNode({
            plugins: [
              entriesVirtualization({
                layout: "grid",
                estimateSize: 40,
                gap: 10,
                overscan: 0,
              }),
            ],
            entryList: {
              style: {
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: 10,
              },
            },
          })}
        </>
      );
    }

    const { rootEl, root } = mountEntryList(<ResponsiveGridProbe />);

    await React.act(async () => {});
    expect(rootEl.querySelectorAll("[data-rmg-entry-owner]")).toHaveLength(2);

    await React.act(async () => {
      rootEl.querySelector<HTMLButtonElement>("button")?.click();
    });
    await React.act(async () => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(rootEl.querySelectorAll("[data-rmg-entry-owner]")).toHaveLength(4);

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("keeps revealed rows ready after transient visibility state resets", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    const renderList = () => {
      root.render(
        <EntryList
          enabled
          entries={{
            items: [{ id: "entry-0", media: [] }],
            loading: { enabled: true, waitForDecode: true },
            reveal: { durationMs: 60, staggerMs: 0 },
          }}
          fsEnabled={false}
          openFullscreenAt={() => undefined}
          entryFlatIndex={[]}
          entryFlatIndexRef={React.createRef<number[][] | null>()}
          nodeFromMedia={() => null}
          renderMediaContainer={() => null}
          breakpoints={{}}
        />,
      );
    };

    await React.act(async () => {
      renderList();
    });
    await flushEntryRevealFrames();

    expect(
      rootEl
        .querySelector("[data-rmg-entry-owner]")
        ?.getAttribute("data-rmg-entry-ready"),
    ).toBe("1");
    expect(
      rootEl
        .querySelector("[data-rmg-entry-skeleton]")
        ?.hasAttribute("data-rmg-entry-shimmer"),
    ).toBe(false);
    entryVisibilityMock.nearView = [false];
    entryVisibilityMock.everInView = [false];

    await React.act(async () => {
      renderList();
    });

    const row = rootEl.querySelector("[data-rmg-entry-owner]");
    expect(row?.getAttribute("data-rmg-entry-ready")).toBe("1");
    expect(row?.getAttribute("data-rmg-entry-mounted")).toBe("1");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("keeps entry media rendered after a revealed row leaves the near threshold", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const renderMedia = vi.fn(({ media }: any) =>
      React.createElement("img", {
        src: media.src,
        alt: media.alt ?? "",
      }),
    );

    const renderList = () => {
      root.render(
        <EntryList
          enabled
          entries={{
            items: [
              {
                id: "entry-media-gate",
                media: [
                  {
                    kind: "image",
                    src: "/media-gate.jpg",
                    alt: "Media gate",
                  },
                ],
              },
            ],
            render: { media: renderMedia },
            loading: { enabled: true, waitForDecode: false },
            reveal: { durationMs: 60, staggerMs: 0 },
          }}
          fsEnabled={false}
          openFullscreenAt={() => undefined}
          entryFlatIndex={[[0]]}
          entryFlatIndexRef={React.createRef<number[][] | null>()}
          nodeFromMedia={() => null}
          renderMediaContainer={({ mediaNodes }) =>
            React.createElement("div", null, mediaNodes)
          }
          breakpoints={{}}
        />,
      );
    };

    entryVisibilityMock.nearView = [true];
    entryVisibilityMock.everInView = [true];

    await React.act(async () => {
      renderList();
    });

    await flushEntryRevealFrames();

    expect(renderMedia).toHaveBeenCalled();
    expect(rootEl.querySelector<HTMLImageElement>("img")?.src).toContain(
      "/media-gate.jpg",
    );

    renderMedia.mockClear();
    entryVisibilityMock.nearView = [false];
    entryVisibilityMock.everInView = [false];

    await React.act(async () => {
      renderList();
    });

    const row = rootEl.querySelector("[data-rmg-entry-owner]");
    expect(row?.getAttribute("data-rmg-entry-ready")).toBe("1");
    expect(row?.getAttribute("data-rmg-entry-mounted")).toBe("1");
    expect(renderMedia).toHaveBeenCalled();
    expect(rootEl.querySelector<HTMLImageElement>("img")?.src).toContain(
      "/media-gate.jpg",
    );

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("stages dynamic reveals again after mounted image decode resolves", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const decodeDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLImageElement.prototype,
      "decode",
    );
    const completeDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLImageElement.prototype,
      "complete",
    );
    let resolveDecode: (() => void) | null = null;
    const decode = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDecode = resolve;
        }),
    );

    const renderList = () => {
      root.render(
        <EntryList
          enabled
          entries={{
            items: [
              {
                id: "entry-decode",
                media: [{ kind: "image", src: "/decode.jpg", alt: "Decode" }],
              },
            ],
            loading: { enabled: true, waitForDecode: true },
            reveal: { durationMs: 60, staggerMs: 0 },
          }}
          fsEnabled={false}
          openFullscreenAt={() => undefined}
          entryFlatIndex={[[0]]}
          entryFlatIndexRef={React.createRef<number[][] | null>()}
          nodeFromMedia={(media: any) =>
            React.createElement("img", {
              src: media.src,
              alt: media.alt ?? "",
            })
          }
          renderMediaContainer={({ mediaNodes }) =>
            React.createElement("div", null, mediaNodes)
          }
          breakpoints={{}}
        />,
      );
    };

    Object.defineProperty(window.HTMLImageElement.prototype, "decode", {
      configurable: true,
      value: decode,
    });
    Object.defineProperty(window.HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => false,
    });

    try {
      await React.act(async () => {
        renderList();
      });

      const row = () => rootEl.querySelector("[data-rmg-entry-owner]");

      expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");
      expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

      await flushEntryRevealFrames();

      expect(decode).toHaveBeenCalledTimes(1);
      expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

      await React.act(async () => {
        resolveDecode?.();
        await Promise.resolve();
      });

      await flushEntryRevealFrames();

      expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      rootEl.remove();

      if (decodeDescriptor) {
        Object.defineProperty(
          window.HTMLImageElement.prototype,
          "decode",
          decodeDescriptor,
        );
      } else {
        delete (window.HTMLImageElement.prototype as any).decode;
      }

      if (completeDescriptor) {
        Object.defineProperty(
          window.HTMLImageElement.prototype,
          "complete",
          completeDescriptor,
        );
      } else {
        delete (window.HTMLImageElement.prototype as any).complete;
      }
    }
  });


  test("waitForDecode false does not hold reveal verification on image decode", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const decodeDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLImageElement.prototype,
      "decode",
    );
    const completeDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLImageElement.prototype,
      "complete",
    );
    const decode = vi.fn(() => new Promise<void>(() => undefined));

    Object.defineProperty(window.HTMLImageElement.prototype, "decode", {
      configurable: true,
      value: decode,
    });
    Object.defineProperty(window.HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => false,
    });

    try {
      await React.act(async () => {
        root.render(
          <EntryList
            enabled
            entries={{
              items: [
                {
                  id: "entry-skip-decode",
                  media: [
                    { kind: "image", src: "/skip-decode.jpg", alt: "Skip" },
                  ],
                },
              ],
              loading: { enabled: true, waitForDecode: false },
              reveal: { durationMs: 60, staggerMs: 0 },
            }}
            fsEnabled={false}
            openFullscreenAt={() => undefined}
            entryFlatIndex={[[0]]}
            entryFlatIndexRef={React.createRef<number[][] | null>()}
            nodeFromMedia={(media: any) =>
              React.createElement("img", {
                src: media.src,
                alt: media.alt ?? "",
              })
            }
            renderMediaContainer={({ mediaNodes }) =>
              React.createElement("div", null, mediaNodes)
            }
            breakpoints={{}}
          />,
        );
      });

      const row = () => rootEl.querySelector("[data-rmg-entry-owner]");

      expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");
      expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

      await flushEntryRevealFrames();

      expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");
      expect(decode).not.toHaveBeenCalled();
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      rootEl.remove();

      if (decodeDescriptor) {
        Object.defineProperty(
          window.HTMLImageElement.prototype,
          "decode",
          decodeDescriptor,
        );
      } else {
        delete (window.HTMLImageElement.prototype as any).decode;
      }

      if (completeDescriptor) {
        Object.defineProperty(
          window.HTMLImageElement.prototype,
          "complete",
          completeDescriptor,
        );
      } else {
        delete (window.HTMLImageElement.prototype as any).complete;
      }
    }
  });

  test("verifies ready rows independently when another row media decode is pending", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const decodeDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLImageElement.prototype,
      "decode",
    );
    const completeDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLImageElement.prototype,
      "complete",
    );
    const decode = vi.fn(() => new Promise<void>(() => undefined));

    Object.defineProperty(window.HTMLImageElement.prototype, "decode", {
      configurable: true,
      value: decode,
    });
    Object.defineProperty(window.HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => false,
    });

    try {
      await React.act(async () => {
        root.render(
          <EntryList
            enabled
            entries={{
              items: [
                {
                  id: "entry-pending-media",
                  media: [
                    {
                      kind: "image",
                      src: "/pending-media.jpg",
                      alt: "Pending media",
                    },
                  ],
                },
                { id: "entry-ready-no-media", media: [] },
              ],
              loading: { enabled: true, waitForDecode: true },
              reveal: { durationMs: 60, staggerMs: 0 },
            }}
            fsEnabled={false}
            openFullscreenAt={() => undefined}
            entryFlatIndex={[[0], []]}
            entryFlatIndexRef={React.createRef<number[][] | null>()}
            nodeFromMedia={(media: any) =>
              React.createElement("img", {
                src: media.src,
                alt: media.alt ?? "",
              })
            }
            renderMediaContainer={({ mediaNodes }) =>
              React.createElement("div", null, mediaNodes)
            }
            breakpoints={{}}
          />,
        );
      });

      const readyStates = () =>
        Array.from(rootEl.querySelectorAll("[data-rmg-entry-owner]")).map(
          (row) => row.getAttribute("data-rmg-entry-ready"),
        );

      await flushEntryRevealFrames();

      expect(decode).toHaveBeenCalled();
      expect(readyStates()).toEqual(["0", "1"]);
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      rootEl.remove();

      if (decodeDescriptor) {
        Object.defineProperty(
          window.HTMLImageElement.prototype,
          "decode",
          decodeDescriptor,
        );
      } else {
        delete (window.HTMLImageElement.prototype as any).decode;
      }

      if (completeDescriptor) {
        Object.defineProperty(
          window.HTMLImageElement.prototype,
          "complete",
          completeDescriptor,
        );
      } else {
        delete (window.HTMLImageElement.prototype as any).complete;
      }
    }
  });

  test("pre-stages near rows before viewport entry", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    const renderList = () => {
      root.render(
        <EntryList
          enabled
          entries={{
            items: [{ id: "entry-offscreen", media: [] }],
            loading: { enabled: true, waitForDecode: true },
            reveal: { durationMs: 60, staggerMs: 0 },
          }}
          fsEnabled={false}
          openFullscreenAt={() => undefined}
          entryFlatIndex={[[]]}
          entryFlatIndexRef={React.createRef<number[][] | null>()}
          nodeFromMedia={() => null}
          renderMediaContainer={() => null}
          breakpoints={{}}
        />,
      );
    };

    entryVisibilityMock.nearView = [true];
    entryVisibilityMock.everInView = [false];

    await React.act(async () => {
      renderList();
    });

    const row = () => rootEl.querySelector("[data-rmg-entry-owner]");

    expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

    entryVisibilityMock.everInView = [true];

    await React.act(async () => {
      renderList();
    });

    expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");

    await flushEntryRevealFrames();

    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("does not block entry reveal on pending document fonts when decode waiting is disabled", async () => {
    const originalFontsDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "fonts",
    );
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        status: "loading",
        ready: new Promise(() => undefined),
      },
    });

    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    try {
      await React.act(async () => {
        root.render(
          <EntryList
            enabled
            entries={{
              items: [{ id: "entry-0", media: [] }],
              loading: { enabled: true, waitForDecode: false },
              reveal: { durationMs: 60, staggerMs: 0 },
            }}
            fsEnabled={false}
            openFullscreenAt={() => undefined}
            entryFlatIndex={[]}
            entryFlatIndexRef={React.createRef<number[][] | null>()}
            nodeFromMedia={() => null}
            renderMediaContainer={() => null}
            breakpoints={{}}
          />,
        );
      });

      await flushEntryRevealFrames();

      expect(
        rootEl
          .querySelector("[data-rmg-entry-owner]")
          ?.getAttribute("data-rmg-entry-ready"),
      ).toBe("1");
    } finally {
      await React.act(async () => {
        root.unmount();
      });
      rootEl.remove();

      if (originalFontsDescriptor) {
        Object.defineProperty(document, "fonts", originalFontsDescriptor);
      } else {
        delete (document as any).fonts;
      }
    }
  });

  test("queues simultaneously revealable rows through the entry reveal scheduler", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    const renderList = () => {
      root.render(
        <EntryList
          enabled
          entries={{
            items: [
              { id: "entry-0", media: [] },
              { id: "entry-1", media: [] },
              { id: "entry-2", media: [] },
            ],
            loading: { enabled: true, waitForDecode: true },
            reveal: { durationMs: 60, staggerMs: 120 },
          }}
          fsEnabled={false}
          openFullscreenAt={() => undefined}
          entryFlatIndex={[[], [], []]}
          entryFlatIndexRef={React.createRef<number[][] | null>()}
          nodeFromMedia={() => null}
          renderMediaContainer={() => null}
          breakpoints={{}}
        />,
      );
    };

    await React.act(async () => {
      renderList();
    });

    const readyStates = () =>
      Array.from(rootEl.querySelectorAll("[data-rmg-entry-owner]")).map((row) =>
        row.getAttribute("data-rmg-entry-ready"),
      );

    expect(readyStates()).toEqual(["0", "0", "0"]);

    await flushEntryRevealFrames();

    expect(readyStates()).toEqual(["1", "0", "0"]);

    await waitMs(125);
    await flushAnimationFrames(2);

    expect(readyStates()).toEqual(["1", "1", "0"]);

    await waitMs(125);
    await flushAnimationFrames(2);

    expect(readyStates()).toEqual(["1", "1", "1"]);

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("uses the current flattened media map for fullscreen triggers after dynamic replacement", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const openFullscreenAt = vi.fn();
    const stalePlaceholderMap = [[0], [1]];
    const currentMap = [
      [0, 1, 2],
      [3, 4],
    ];

    await React.act(async () => {
      root.render(
        <EntryList
          enabled
          entries={{
            items: [
              {
                id: "entry-0",
                media: [
                  { kind: "image", src: "/a.jpg", alt: "A" },
                  { kind: "image", src: "/b.jpg", alt: "B" },
                  { kind: "image", src: "/c.jpg", alt: "C" },
                ],
              },
              {
                id: "entry-1",
                media: [
                  { kind: "image", src: "/d.jpg", alt: "D" },
                  { kind: "image", src: "/e.jpg", alt: "E" },
                ],
              },
            ],
            loading: { enabled: false },
          }}
          fsEnabled
          openFullscreenAt={openFullscreenAt}
          entryFlatIndex={currentMap}
          entryFlatIndexRef={{ current: stalePlaceholderMap }}
          nodeFromMedia={(media) => (
            <img src={(media as any).src} alt={(media as any).alt ?? ""} />
          )}
          renderMediaContainer={({ mediaNodes }) => <div>{mediaNodes}</div>}
          breakpoints={{}}
        />,
      );
    });

    rootEl.querySelector<HTMLImageElement>('img[alt="D"]')?.click();

    expect(openFullscreenAt).toHaveBeenCalledWith(
      3,
      expect.any(HTMLImageElement),
    );

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("lets built-in fullscreen triggers request video entries", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const onRequest = vi.fn();

    await React.act(async () => {
      root.render(
        <GalleryCore layout="entries">
          <FullscreenRequestProbe onRequest={onRequest} />
          <Entries
            entries={{
              items: [
                {
                  id: "entry-video",
                  media: [
                    {
                      kind: "video",
                      src: "/clip.mp4",
                      poster: "/poster.jpg",
                      alt: "Clip",
                    },
                  ],
                },
              ],
              loading: { enabled: false },
              render: {
                media: ({ media }) =>
                  media.kind === "video" ? (
                    <video aria-label={media.alt} src={media.src} />
                  ) : null,
              },
            }}
            fullscreen={{ enabled: true }}
            renderMediaContainer={({ mediaNodes }) => <div>{mediaNodes}</div>}
          />
        </GalleryCore>,
      );
    });

    await React.act(async () => {
      rootEl.querySelector<HTMLVideoElement>('video[aria-label="Clip"]')?.click();
    });

    expect(onRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "entries",
        index: 0,
        image: null,
      }),
    );

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });
});
