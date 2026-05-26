// @vitest-environment jsdom
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GalleryCore, useGalleryCore } from "../../core";
import { useFullscreenController } from "../../fullscreen";
import type { FullscreenPlugin } from "../../fullscreen/types";
import { Masonry } from "./index";
import { masonryFullscreen, resolveMasonryFullscreenClick } from "./plugins/fullscreen";
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
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
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

function MasonryFullscreenProbe({
  onOpen,
}: {
  onOpen: (request: { source: string; index: number; image: HTMLImageElement | null }) => void;
}) {
  const core = useGalleryCore();
  useFullscreenController({
    fullscreen: { enabled: true },
    plugins: [testFullscreenRuntime],
  });

  React.useEffect(() => core.fsOpenSub.subscribe(onOpen as any), [core, onOpen]);

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
  test("renders dimensioned Masonry.Item children with positioned wrappers", () => {
    const markup = renderToStaticMarkup(
      <Masonry columns={2} gap={12}>
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
        <Masonry.Item width={1200} height={1600} span="full">
          <img src="/b.jpg" alt="B" />
        </Masonry.Item>
      </Masonry>
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

  test("activates the light masonry reveal after mount and in-view readiness", async () => {
    const host = mount(
      <Masonry columns={2} gap={12}>
        <Masonry.Item width={1200} height={900}>
          <img src="/a.jpg" alt="A" />
        </Masonry.Item>
      </Masonry>
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
      />
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
      />
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
        timing={{ exitMs: 1200, minVisibleMs: 300 }}
      >
        <Masonry columns={2} gap={12}>
          <Masonry.Item width={1200} height={900}>
            <img src="/a.jpg" alt="A" />
          </Masonry.Item>
        </Masonry>
      </MasonrySkeleton>
    );

    expect(markup).toContain('data-rmg-light-mskel-loading-layer="true"');
    expect(markup).toContain('data-rmg-light-mskel-content-layer="true"');
    expect(markup).toContain("--rmg-light-mskel-exit-ms:1200ms");
    expect(markup).toContain(skeletonStyles.contentBlocked);
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
      host.querySelector('[data-rmg-light-mskel-loading-layer="true"]')
    ).not.toBeNull();

    React.act(() => {
      mountedRoot?.render(render(true));
    });
    expect(host.querySelector(`.${skeletonStyles.loadingLayerExit}`)).toBeNull();

    await React.act(async () => {
      vi.advanceTimersByTime(499);
    });
    expect(host.querySelector(`.${skeletonStyles.loadingLayerExit}`)).toBeNull();

    await React.act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(host.querySelector(`.${skeletonStyles.loadingLayerExit}`)).not.toBeNull();

    await React.act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(host.querySelector('[data-rmg-light-mskel-loading-layer="true"]')).toBeNull();
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
      </GalleryCore>
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
        })
      );
    });

    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "masonry",
        index: 1,
        image,
      })
    );
  });

  test("does not open light masonry fullscreen after a drag-like pointer move", async () => {
    const onOpen = vi.fn();
    const host = mount(
      <GalleryCore layout="masonry" fullscreenItems={["/a.jpg"]}>
        <MasonryFullscreenProbe onOpen={onOpen} />
      </GalleryCore>
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
        })
      );
      image.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 0,
        })
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
      </Masonry>
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
        </Masonry>
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
