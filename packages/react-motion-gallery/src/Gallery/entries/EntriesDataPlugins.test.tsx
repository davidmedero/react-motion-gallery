// @vitest-environment jsdom

import * as React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { EntryList } from "./components/EntryList";
import { entriesInfiniteScroll } from "./plugins/infiniteScroll";
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
  inView: [true, true, true] as boolean[],
  everInView: [true, true, true] as boolean[],
}));

vi.mock("./hooks/useEntryInView", () => ({
  useEntryInView: () => ({
    nearView: entryVisibilityMock.nearView,
    inView: entryVisibilityMock.inView,
    everInView: entryVisibilityMock.everInView,
    setEntryRef: () => () => undefined,
  }),
}));

vi.mock("../shared/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => false,
}));

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
  entryVisibilityMock.inView = [true, true, true];
  entryVisibilityMock.everInView = [true, true, true];
  MockIntersectionObserver.instances = [];
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

async function flushEntryRevealFrames() {
  await flushAnimationFrames(2);
  await flushMicrotasks();
  await flushAnimationFrames(2);
  await flushMicrotasks();
  await flushAnimationFrames(2);
}

function ReportingEntryMedia(props: {
  mediaNodes: React.ReactNode[];
  ready: boolean;
  onMediaReadyChange?: (ready: boolean) => void;
}) {
  const { mediaNodes, ready, onMediaReadyChange } = props;

  React.useEffect(() => {
    onMediaReadyChange?.(ready);
  }, [onMediaReadyChange, ready]);

  return <div>{mediaNodes}</div>;
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
  entryVisibilityMock.inView = items.map(() => true);
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
                waitForMedia: true,
              },
              reveal: { durationMs: 60 },
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
  entryVisibilityMock.inView = [true, true];
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

  test("infinite-scroll continues when rendered entries grow while visible", async () => {
    const originalIntersectionObserver = globalThis.IntersectionObserver;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const onLoadMore = vi.fn();

    function EntriesInfiniteProbe() {
      const [visibleCount, setVisibleCount] = React.useState(1);
      const items = React.useMemo(() => virtualEntries(3), []);

      return (
        <EntryList
          enabled
          entries={{
            items,
            loading: { enabled: false },
            plugins: [
              entriesLoadMore({
                visibleCount,
                total: 3,
                loading: false,
              }),
              entriesInfiniteScroll({
                hasMore: visibleCount < 3,
                loading: false,
                onLoadMore: () => {
                  onLoadMore();
                  setVisibleCount((count) => Math.min(3, count + 1));
                },
              }),
            ],
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

    const { rootEl, root } = mountEntryList(<EntriesInfiniteProbe />);

    try {
      await flushMicrotasks();
      const getSentinelObserver = () =>
        MockIntersectionObserver.instances
          .slice()
          .reverse()
          .find(
            (entry) =>
              entry.target instanceof HTMLElement &&
              entry.target.hasAttribute("data-rmg-entries-infinite-sentinel"),
          );

      expect(rootEl.querySelectorAll("[data-rmg-entry-owner]")).toHaveLength(1);

      React.act(() => {
        getSentinelObserver()?.trigger(true);
      });

      expect(onLoadMore).toHaveBeenCalledTimes(1);
      expect(rootEl.querySelectorAll("[data-rmg-entry-owner]")).toHaveLength(2);

      await flushAnimationFrames(1);

      expect(onLoadMore).toHaveBeenCalledTimes(2);
      expect(rootEl.querySelectorAll("[data-rmg-entry-owner]")).toHaveLength(3);
    } finally {
      React.act(() => {
        root.unmount();
      });
      rootEl.remove();
      vi.stubGlobal("IntersectionObserver", originalIntersectionObserver);
    }
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

  test("virtualization can use a nested scroll root", async () => {
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const scrollRoot = document.querySelector<HTMLElement>(
          ".entry-virtual-scroll-root-test",
        );
        const isScrollRoot = this.classList.contains(
          "entry-virtual-scroll-root-test",
        );
        const isList = this.classList.contains(
          "entry-list-inside-scroll-root-test",
        );
        const top = isList ? -(scrollRoot?.scrollTop ?? 0) : 0;
        const height = isScrollRoot ? 90 : 40;

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

    function NestedScrollRootProbe() {
      const scrollRootRef = React.useRef<HTMLDivElement | null>(null);

      return (
        <div
          ref={scrollRootRef}
          className="entry-virtual-scroll-root-test"
        >
          {virtualEntryListNode({
            count: 8,
            plugins: [
              entriesVirtualization({
                estimateSize: 40,
                gap: 10,
                overscan: 0,
                scrollRoot: scrollRootRef,
              }),
            ],
            entryList: {
              className: "entry-list-inside-scroll-root-test",
            },
          })}
        </div>
      );
    }

    const { rootEl, root } = mountEntryList(<NestedScrollRootProbe />);

    await React.act(async () => {});

    expect(
      Array.from(rootEl.querySelectorAll("[data-rmg-entry-owner]")).map((row) =>
        row.getAttribute("data-rmg-entry-owner"),
      ),
    ).toEqual(["0", "1"]);

    const scrollRoot = rootEl.querySelector<HTMLElement>(
      ".entry-virtual-scroll-root-test",
    );

    await React.act(async () => {
      if (scrollRoot) {
        scrollRoot.scrollTop = 100;
        scrollRoot.dispatchEvent(new Event("scroll"));
      }
    });

    expect(
      Array.from(rootEl.querySelectorAll("[data-rmg-entry-owner]")).map((row) =>
        row.getAttribute("data-rmg-entry-owner"),
      ),
    ).toEqual(["2", "3"]);
    expect(
      rootEl.querySelector<HTMLElement>(
        "[data-rmg-entry-virtual-spacer='top']",
      )?.style.height,
    ).toBe("90px");

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
            loading: { enabled: true, waitForMedia: true },
            reveal: { durationMs: 60 },
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
    entryVisibilityMock.inView = [false];
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

  test("stages dynamic reveals again after nested media readiness flips", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    let mediaReady = false;

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
            loading: { enabled: true, waitForMedia: true },
            reveal: { durationMs: 60 },
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
          renderMediaContainer={({ mediaNodes, onMediaReadyChange }) =>
            React.createElement(ReportingEntryMedia, {
              mediaNodes,
              ready: mediaReady,
              onMediaReadyChange,
            })
          }
          breakpoints={{}}
        />,
      );
    };

    await React.act(async () => {
      renderList();
    });

    const row = () => rootEl.querySelector("[data-rmg-entry-owner]");

    expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

    await flushAnimationFrames(2);

    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

    mediaReady = true;

    await React.act(async () => {
      renderList();
    });
    await flushEntryRevealFrames();

    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("waitForMedia false does not hold row reveal on image decode", async () => {
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
              loading: { enabled: true, waitForMedia: false },
              reveal: { durationMs: 60 },
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

  test("mounts near rows but waits for current viewport before reveal", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    const renderList = () => {
      root.render(
        <EntryList
          enabled
          entries={{
            items: [{ id: "entry-offscreen", media: [] }],
            loading: { enabled: true, waitForMedia: true },
            reveal: { durationMs: 60 },
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
    entryVisibilityMock.inView = [false];
    entryVisibilityMock.everInView = [false];

    await React.act(async () => {
      renderList();
    });

    const row = () => rootEl.querySelector("[data-rmg-entry-owner]");

    expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("0");

    entryVisibilityMock.inView = [true];
    entryVisibilityMock.everInView = [true];

    await React.act(async () => {
      renderList();
    });
    await flushEntryRevealFrames();

    expect(row()?.getAttribute("data-rmg-entry-mounted")).toBe("1");
    expect(row()?.getAttribute("data-rmg-entry-ready")).toBe("1");

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("reveals currently visible rows together and waits for offscreen rows", async () => {
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
            loading: { enabled: true, waitForMedia: true },
            reveal: { durationMs: 60 },
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

    entryVisibilityMock.nearView = [true, true, true];
    entryVisibilityMock.inView = [true, false, true];
    entryVisibilityMock.everInView = [true, false, true];

    await React.act(async () => {
      renderList();
    });

    const readyStates = () =>
      Array.from(rootEl.querySelectorAll("[data-rmg-entry-owner]")).map((row) =>
        row.getAttribute("data-rmg-entry-ready"),
      );

    expect(readyStates()).toEqual(["0", "0", "0"]);

    await flushEntryRevealFrames();

    expect(readyStates()).toEqual(["1", "0", "1"]);

    entryVisibilityMock.inView = [true, true, true];
    entryVisibilityMock.everInView = [true, true, true];

    await React.act(async () => {
      renderList();
    });
    await flushEntryRevealFrames();

    expect(readyStates()).toEqual(["1", "1", "1"]);

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("does not let one slow entry verification block another visible row", async () => {
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
    const slowDecode = new Promise<void>(() => undefined);
    const decode = vi.fn(function (this: HTMLImageElement) {
      return this.getAttribute("src") === "/slow.jpg"
        ? slowDecode
        : Promise.resolve();
    });

    Object.defineProperty(window.HTMLImageElement.prototype, "decode", {
      configurable: true,
      value: decode,
    });
    Object.defineProperty(window.HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => false,
    });

    try {
      entryVisibilityMock.nearView = [true, true];
      entryVisibilityMock.inView = [true, true];
      entryVisibilityMock.everInView = [true, true];

      await React.act(async () => {
        root.render(
          <EntryList
            enabled
            entries={{
              items: [
                {
                  id: "entry-slow",
                  media: [{ kind: "image", src: "/slow.jpg", alt: "Slow" }],
                },
                {
                  id: "entry-fast",
                  media: [{ kind: "image", src: "/fast.jpg", alt: "Fast" }],
                },
              ],
              loading: { enabled: true, waitForMedia: true },
              reveal: { durationMs: 60 },
            }}
            fsEnabled={false}
            openFullscreenAt={() => undefined}
            entryFlatIndex={[[0], [1]]}
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

      await flushEntryRevealFrames();

      const readyStates = () =>
        Array.from(rootEl.querySelectorAll("[data-rmg-entry-owner]")).map(
          (row) => row.getAttribute("data-rmg-entry-ready"),
        );

      expect(readyStates()).toEqual(["0", "1"]);
      expect(decode).toHaveBeenCalled();
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
});
