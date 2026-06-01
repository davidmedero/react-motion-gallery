// @vitest-environment jsdom
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GalleryCore, useGalleryCore } from "../../core";
import { useFullscreenController } from "../../fullscreen";
import type { FullscreenPlugin } from "../../fullscreen/types";
import { Masonry } from "./index";
import {
  masonryFullscreen,
  resolveMasonryFullscreenClick,
} from "./plugins/fullscreen";
import { masonryInfiniteScroll } from "../plugins/infiniteScroll";
import { masonryLoadMore } from "../plugins/loadMore";
import { masonryPagination } from "../plugins/pagination";
import { masonryVirtualization } from "../plugins/virtualization";
import { masonryLazyLoad } from "../../../masonry-lazy-load";
import masonryStyles from "./MasonryLight.module.css";
import { MasonrySkeleton } from "../../skeleton/masonry";
import skeletonStyles from "../../skeleton/MasonryLightSkeleton.module.css";

let mountedRoot: Root | null = null;
let mountedHost: HTMLDivElement | null = null;

afterEach(() => {
  if (mountedRoot) {
    React.act(() => {
      mountedRoot?.unmount();
    });
  }
  mountedRoot = null;
  mountedHost?.remove();
  mountedHost = null;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  MockIntersectionObserver.instances = [];
});

function mount(node: React.ReactNode) {
  mountedHost = document.createElement("div");
  document.body.appendChild(mountedHost);
  mountedRoot = createRoot(mountedHost);
  React.act(() => {
    mountedRoot?.render(node);
  });
  return mountedHost;
}

const testFullscreenRuntime = {
  __rmgFullscreenPlugin: true,
  kind: "slider",
  RuntimeHost: () => null,
} as unknown as FullscreenPlugin;

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

function renderLightCards(
  plugins: React.ComponentProps<typeof Masonry>["plugins"],
) {
  return renderToStaticMarkup(
    <Masonry columns={1} gap={12} plugins={plugins}>
      <Masonry.Item width={1200} height={900}>
        <img src="/a.jpg" alt="A" />
      </Masonry.Item>
      <Masonry.Item width={1200} height={900}>
        <img src="/b.jpg" alt="B" />
      </Masonry.Item>
      <Masonry.Item width={1200} height={900}>
        <img src="/c.jpg" alt="C" />
      </Masonry.Item>
    </Masonry>,
  );
}

function MasonryFullscreenProbe({
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
    <Masonry columns={2} gap={12} plugins={[masonryFullscreen()]}>
      <Masonry.Item width={1200} height={900}>
        <img src="/a.jpg" alt="A" />
      </Masonry.Item>
      <Masonry.Item width={1200} height={1600}>
        <img src="/b.jpg" alt="B" />
      </Masonry.Item>
    </Masonry>
  );
}

describe("light Masonry public rendering", () => {
  test("renders loading placeholders through the item lifecycle skeleton args", () => {
    const skeletonArgs: Array<{
      index: number;
      itemIndex?: number;
      key: React.Key;
      revealKey?: React.Key;
      placeholder: boolean;
      ready: boolean;
      width?: number;
      height?: number;
    }> = [];
    const markup = renderToStaticMarkup(
      <Masonry
        columns={2}
        gap={12}
        loading={{
          active: true,
          count: 2,
          skeleton: (args) => {
            skeletonArgs.push(args);
            return (
              <span data-testid={`masonry-skeleton-${args.index}`}>
                {String(args.ready)}
              </span>
            );
          },
        }}
      />,
    );

    expect(skeletonArgs).toEqual([
      expect.objectContaining({
        index: 0,
        itemIndex: -1,
        key: "rmg-masonry-loading-0",
        revealKey: -1,
        placeholder: true,
        ready: false,
        width: 100,
        height: 100,
      }),
      expect.objectContaining({
        index: 1,
        itemIndex: -2,
        key: "rmg-masonry-loading-1",
        revealKey: -2,
        placeholder: true,
        ready: false,
        width: 100,
        height: 100,
      }),
    ]);
    expect(markup).toContain('data-rmg-masonry-loading="true"');
    expect(markup).toContain('data-rmg-masonry-item-stage="1"');
    expect(markup).toContain('data-rmg-masonry-item-skeleton="true"');
    expect(markup).not.toContain(masonryStyles.revealContainer);
  });

  test("passes reveal keys and skeleton item dimensions to light masonry loading", () => {
    const skeletonArgs: Array<{
      index: number;
      revealKey?: React.Key;
      placeholder: boolean;
      width?: number;
      height?: number;
    }> = [];
    renderToStaticMarkup(
      <Masonry
        columns={1}
        gap={12}
        loading={{
          skeleton: (args) => {
            skeletonArgs.push(args);
            return <span />;
          },
        }}
      >
        <Masonry.Item width={1200} height={900} revealKey="image-a">
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
      </Masonry>,
    );

    expect(skeletonArgs).toEqual([
      expect.objectContaining({
        index: 0,
        revealKey: "image-a",
        placeholder: false,
        width: 1200,
        height: 900,
      }),
    ]);
  });

  test("renders dimensioned Masonry.Item children with positioned wrappers", () => {
    const markup = renderToStaticMarkup(
      <Masonry columns={2} gap={12}>
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
        <Masonry.Item width={1200} height={1600} span="full">
          <img src="/b.jpg" alt="B" />
        </Masonry.Item>
      </Masonry>,
    );

    expect(markup).toContain("--rmg-cols:2");
    expect(markup).toContain("--rmg-gap:12px");
    expect(markup).toContain('data-rmg-idx="0"');
    expect(markup).toContain('data-rmg-idx="1"');
    expect(markup).toContain('src="/a.jpg"');
    expect(markup).toContain("rmg__masonry-item");
    expect(markup).toContain("cqw");
    expect(markup).toContain(masonryStyles.revealContainer);
    expect(markup).toContain("--rmg-reveal-index:0");
    expect(markup).toContain("--rmg-reveal-duration:600ms");
    expect(markup).not.toContain(masonryStyles.revealActive);
  });

  test("emits responsive first-paint positioning before the viewport is known", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={{ 0: 1, 720: 2, 1140: 3 }}
        gap={{ 0: 12, 1140: 18 }}
        loading={{
          skeleton: {
            columns: { 0: 1, 720: 2, 1140: 3 },
            gap: { 0: 12, 1140: 18 },
            items: [
              { width: 1200, height: 900 },
              { width: 1200, height: 1600 },
              { width: 1600, height: 1000 },
            ],
          },
        }}
      >
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
        <Masonry.Item width={1200} height={1600}>
          <img src="/b.jpg" alt="B" />
        </Masonry.Item>
        <Masonry.Item width={1600} height={1000}>
          <img src="/c.jpg" alt="C" />
        </Masonry.Item>
      </Masonry>,
    );

    expect(markup).toContain("data-rmg-masonry-fluid-scope=");
    expect(markup).toContain('data-rmg-masonry-fluid-spacer="true"');
    expect(markup).toContain('data-rmg-masonry-fluid-index="0"');
    expect(markup).toContain("@media (min-width:1140px)");
    expect(markup).toContain("height:auto !important");
    expect(markup).toContain("--rmg-cols:3 !important");
    expect(markup).toContain(
      '[data-rmg-masonry-fluid-spacer="true"]{display:block !important;width:100% !important;height:',
    );
    expect(markup).toContain("width:calc(33.333cqw - 12px) !important");
  });

  test("client pagination narrows light masonry items and preserves source indices", () => {
    const markup = renderLightCards([
      masonryPagination({ pageIndex: 1, pageSize: 1 }),
    ]);

    expect(markup).not.toContain('src="/a.jpg"');
    expect(markup).toContain('src="/b.jpg"');
    expect(markup).not.toContain('src="/c.jpg"');
    expect(markup).toContain('data-rmg-idx="1"');
  });

  test("server pagination leaves the supplied light masonry window untouched", () => {
    const markup = renderLightCards([
      masonryPagination({
        mode: "server",
        pageIndex: 2,
        pageSize: 1,
        total: 12,
      }),
    ]);

    expect(markup).toContain('src="/a.jpg"');
    expect(markup).toContain('src="/b.jpg"');
    expect(markup).toContain('src="/c.jpg"');
  });

  test("load-more limits light masonry items", () => {
    const markup = renderLightCards([masonryLoadMore({ visibleCount: 2 })]);

    expect(markup).toContain('src="/a.jpg"');
    expect(markup).toContain('src="/b.jpg"');
    expect(markup).not.toContain('src="/c.jpg"');
    expect(markup).toContain('data-rmg-idx="1"');
    expect(markup).not.toContain('data-rmg-idx="2"');
  });

  test("infinite-scroll renders a light masonry sentinel after the root", () => {
    const host = mount(
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
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
      </Masonry>,
    );

    const root = host.querySelector(`.${masonryStyles.root}`);
    const sentinel = host.querySelector("[data-rmg-data-sentinel='masonry']");

    expect(root?.nextElementSibling).toBe(sentinel);
    expect(sentinel?.textContent).toBe("Loading more");
  });

  test("infinite-scroll calls onLoadMore once per armed light masonry intersection", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const onLoadMore = vi.fn();

    mount(
      <Masonry
        columns={1}
        gap={12}
        plugins={[
          masonryInfiniteScroll({
            hasMore: true,
            loading: false,
            onLoadMore,
          }),
        ]}
      >
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
      </Masonry>,
    );

    expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0);

    React.act(() => {
      MockIntersectionObserver.instances.forEach((observer) =>
        observer.trigger(true),
      );
      MockIntersectionObserver.instances.forEach((observer) =>
        observer.trigger(true),
      );
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    React.act(() => {
      MockIntersectionObserver.instances.forEach((observer) =>
        observer.trigger(false),
      );
      MockIntersectionObserver.instances.forEach((observer) =>
        observer.trigger(true),
      );
    });
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  test("loading data plugins keep light masonry busy until loading clears", async () => {
    const rectSpy = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRectMock() {
        return {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 640,
          bottom: 480,
          width: 640,
          height: 480,
          toJSON: () => ({}),
        } as DOMRect;
      });
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
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
      </Masonry>
    );

    try {
      const host = mount(render(true));
      await React.act(async () => {});
      expect(
        host.querySelector(`.${masonryStyles.root}`)?.getAttribute("aria-busy"),
      ).toBe("true");

      await React.act(async () => {
        mountedRoot?.render(render(false));
        await Promise.resolve();
      });
      expect(
        host.querySelector(`.${masonryStyles.root}`)?.getAttribute("aria-busy"),
      ).toBeNull();
    } finally {
      rectSpy.mockRestore();
    }
  });

  test("virtualization windows light masonry positioned items", async () => {
    Object.defineProperty(window, "innerHeight", {
      value: 90,
      configurable: true,
    });
    const rectSpy = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRectMock() {
        return {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 640,
          bottom: 480,
          width: 640,
          height: 480,
          toJSON: () => ({}),
        } as DOMRect;
      });

    try {
      const host = mount(
        <Masonry
          columns={1}
          gap={10}
          plugins={[
            masonryVirtualization({
              estimateSize: 40,
              gap: 10,
              overscan: 0,
            }),
          ]}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <Masonry.Item key={index} width={1200} height={600}>
              <img src={`/${index}.jpg`} alt={`Image ${index}`} />
            </Masonry.Item>
          ))}
        </Masonry>,
      );

      await React.act(async () => {});

      expect(host.querySelectorAll("[data-rmg-idx]").length).toBeLessThan(8);
      expect(host.querySelector("[data-rmg-idx='0']")).not.toBeNull();
    } finally {
      rectSpy.mockRestore();
    }
  });

  test("activates the light masonry reveal after mount and in-view readiness", async () => {
    const host = mount(
      <Masonry columns={2} gap={12}>
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
      </Masonry>,
    );

    await React.act(async () => {});

    expect(host.querySelector(`.${masonryStyles.revealActive}`)).not.toBeNull();
  });

  test("renders the lean masonry skeleton without structured text nodes", () => {
    const markup = renderToStaticMarkup(
      <MasonrySkeleton
        columns={2}
        gap={12}
        items={[
          { width: 1200, height: 900 },
          { width: 1200, height: 1600, span: "full" },
        ]}
      />,
    );

    expect(markup).toContain('data-rmg-mskel-index="0"');
    expect(markup).toContain('data-rmg-mskel-index="1"');
    expect(markup).toContain("cqw");
    expect(markup).not.toContain('data-rmg-skel-text="true"');
  });

  test("renders responsive first-paint variants for lean masonry skeletons", () => {
    const markup = renderToStaticMarkup(
      <MasonrySkeleton
        columns={{ 0: 1, 720: 2, 1080: 3 }}
        gap={{ 0: 12, 900: 16 }}
        items={[
          { width: 1200, height: 1600 },
          { width: 1200, height: 900 },
          { width: 1600, height: 1000, span: { 0: 1, 1080: 2 } },
        ]}
      />,
    );

    expect(markup).toContain("data-rmg-mskel-scope");
    expect(markup).toContain("lmskel_");
    expect(markup).toContain(skeletonStyles.rootFrame);
    expect(markup).not.toContain("_R_");
    expect(markup).toContain("@media (min-width:1080px)");
    expect(markup).toContain("calc(66.667cqw - 5.333px)");
    expect(markup).toContain('data-rmg-mskel-index="2"');
    expect(markup).not.toContain('data-rmg-skel-text="true"');
  });

  test("keeps the lean masonry skeleton mounted for timed exits", () => {
    const markup = renderToStaticMarkup(
      <MasonrySkeleton
        columns={2}
        gap={12}
        items={[{ width: 1200, height: 900 }]}
        ready={false}
        timing={{ enterMs: 480, exitMs: 1200, minVisibleMs: 300 }}
      >
        <Masonry columns={2} gap={12}>
          <Masonry.Item width={1200} height={900}>
            <img src="/a.jpg" alt="A" />
          </Masonry.Item>
        </Masonry>
      </MasonrySkeleton>,
    );

    expect(markup).toContain('data-rmg-light-mskel-loading-layer="true"');
    expect(markup).toContain('data-rmg-light-mskel-content-layer="true"');
    expect(markup).toContain("--rmg-light-mskel-enter-ms:480ms");
    expect(markup).toContain("--rmg-light-mskel-exit-ms:1200ms");
    expect(markup).toContain(skeletonStyles.contentBlocked);
  });

  test("applies separate lean masonry item skeleton enter and exit durations", () => {
    const markup = renderToStaticMarkup(
      <Masonry
        columns={1}
        gap={12}
        loading={{
          skeleton: ({ index, ready }) => (
            <span data-test-skeleton={index} data-ready={String(ready)} />
          ),
          timing: { enterMs: 180, exitMs: 420 },
        }}
      >
        <Masonry.Item width={1200} height={900}>
          <article>alpha</article>
        </Masonry.Item>
      </Masonry>,
    );

    expect(markup).toContain('data-rmg-masonry-item-skeleton="true"');
    expect(markup).toContain("--rmg-masonry-item-skeleton-enter-duration:180ms");
    expect(markup).toContain("--rmg-masonry-item-skeleton-exit-duration:420ms");
  });

  test("waits for minVisibleMs before the lean masonry skeleton exits", async () => {
    vi.useFakeTimers();

    const render = (ready: boolean) => (
      <MasonrySkeleton
        columns={2}
        gap={12}
        items={[{ width: 1200, height: 900 }]}
        ready={ready}
        timing={{ exitMs: 200, minVisibleMs: 500 }}
      >
        <Masonry columns={2} gap={12}>
          <Masonry.Item width={1200} height={900}>
            <img src="/a.jpg" alt="A" />
          </Masonry.Item>
        </Masonry>
      </MasonrySkeleton>
    );

    const host = mount(render(false));
    expect(
      host.querySelector('[data-rmg-light-mskel-loading-layer="true"]'),
    ).not.toBeNull();

    React.act(() => {
      mountedRoot?.render(render(true));
    });
    expect(
      host.querySelector(`.${skeletonStyles.loadingLayerExit}`),
    ).toBeNull();

    await React.act(async () => {
      vi.advanceTimersByTime(499);
    });
    expect(
      host.querySelector(`.${skeletonStyles.loadingLayerExit}`),
    ).toBeNull();

    await React.act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(
      host.querySelector(`.${skeletonStyles.loadingLayerExit}`),
    ).not.toBeNull();

    await React.act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(
      host.querySelector('[data-rmg-light-mskel-loading-layer="true"]'),
    ).toBeNull();
  });

  test("resolves light masonry fullscreen targets and ignores interactive children", () => {
    const item = document.createElement("div");
    item.setAttribute("data-rmg-idx", "3");
    const img = document.createElement("img");
    item.appendChild(img);
    const button = document.createElement("button");
    button.appendChild(document.createElement("img"));
    item.appendChild(button);

    expect(resolveMasonryFullscreenClick(img)).toMatchObject({
      index: 3,
      image: img,
    });
    expect(resolveMasonryFullscreenClick(button)).toBeNull();
  });

  test("opens GalleryCore fullscreen from the light masonry fullscreen plugin", async () => {
    const onOpen = vi.fn();
    const host = mount(
      <GalleryCore layout="masonry" fullscreenItems={["/a.jpg", "/b.jpg"]}>
        <MasonryFullscreenProbe onOpen={onOpen} />
      </GalleryCore>,
    );

    await React.act(async () => {});
    await React.act(async () => {});

    const root = host.querySelector<HTMLElement>(`.${masonryStyles.root}`)!;
    const image = host.querySelectorAll<HTMLImageElement>("img")[1]!;
    expect(root.getAttribute("data-rmg-fullscreen-enabled")).toBe("true");

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
        source: "masonry",
        index: 1,
        image,
      }),
    );
  });

  test("does not open light masonry fullscreen after a drag-like pointer move", async () => {
    const onOpen = vi.fn();
    const host = mount(
      <GalleryCore layout="masonry" fullscreenItems={["/a.jpg"]}>
        <MasonryFullscreenProbe onOpen={onOpen} />
      </GalleryCore>,
    );

    await React.act(async () => {});
    await React.act(async () => {});

    const image = host.querySelector<HTMLImageElement>("img")!;
    React.act(() => {
      image.dispatchEvent(
        new MouseEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      );
      image.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 0,
        }),
      );
    });

    expect(onOpen).not.toHaveBeenCalled();
  });

  test("keeps the light masonry fullscreen plugin inert outside GalleryCore", async () => {
    const host = mount(
      <Masonry columns={2} gap={12} plugins={[masonryFullscreen()]}>
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
      </Masonry>,
    );

    await React.act(async () => {});

    const root = host.querySelector<HTMLElement>(`.${masonryStyles.root}`)!;
    expect(root.getAttribute("data-rmg-fullscreen-enabled")).toBeNull();
  });

  test("uses the masonry lazy-load plugin with light masonry items", async () => {
    const previousIntersectionObserver = globalThis.IntersectionObserver;
    class IdleIntersectionObserver {
      observe() {}
      disconnect() {}
    }
    (globalThis as any).IntersectionObserver = IdleIntersectionObserver;

    try {
      const host = mount(
        <Masonry columns={1} gap={12} plugins={[masonryLazyLoad()]}>
          <Masonry.Item width={1200} height={900}>
            <img src="/a.jpg" alt="A" />
          </Masonry.Item>
        </Masonry>,
      );

      await React.act(async () => {});

      const image = host.querySelector<HTMLImageElement>("img")!;
      const spinner = host.querySelector<HTMLElement>("[data-rmg-spinner]")!;
      expect(host.querySelector("[data-rmg-lazyload]")).not.toBeNull();
      expect(image.getAttribute("data-rmg-lazy-src")).toBe("/a.jpg");
      expect(image.getAttribute("src")).toContain("data:image/gif");
      expect(spinner).not.toBeNull();
      expect(spinner.style.opacity).toBe("1");
      expect(spinner.style.visibility).toBe("visible");
    } finally {
      (globalThis as any).IntersectionObserver = previousIntersectionObserver;
    }
  });
});
