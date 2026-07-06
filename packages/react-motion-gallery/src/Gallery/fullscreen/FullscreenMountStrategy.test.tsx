// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { GalleryCore, useGalleryCore } from "../core";
import { FullscreenRuntime } from "./FullscreenRuntime";
import { useFullscreenController } from ".";
import { createFullscreenPlugin } from "./plugins/create";
import { fullscreenLazyLoad } from "./plugins/lazyLoad";
import type { FullscreenMountStrategy } from "./types";

const runtimePlugin = createFullscreenPlugin("slider", {
  RuntimeHost: FullscreenRuntime,
});

type Mounted = {
  container: HTMLDivElement;
  root: Root;
};

function FullscreenAddon({
  mountStrategy,
  lazyLoad,
}: {
  mountStrategy?: FullscreenMountStrategy;
  lazyLoad?: boolean;
}) {
  const { fullscreenNode } = useFullscreenController({
    plugins: lazyLoad ? [runtimePlugin, fullscreenLazyLoad()] : [runtimePlugin],
    fullscreen: {
      enabled: true,
      mountStrategy,
      lazyLoad: lazyLoad
        ? {
            images: {
              enabled: true,
            },
          }
        : undefined,
      effects: {
        introFade: true,
        introDuration: {
          transform: 10,
          fade: 10,
        },
      },
    },
  });

  return <>{fullscreenNode}</>;
}

function OpenButton({
  onAfterOpenRequest,
}: {
  onAfterOpenRequest?: () => void;
}) {
  const core = useGalleryCore();

  return (
    <button
      type="button"
      onClick={(event) => {
        core.openFullscreenAt({
          index: 0,
          method: "fade",
          event: event.nativeEvent,
        });
        onAfterOpenRequest?.();
      }}
    >
      Open
    </button>
  );
}

function TestGallery({
  mountStrategy,
  lazyLoad,
  onAfterOpenRequest,
}: {
  mountStrategy?: FullscreenMountStrategy;
  lazyLoad?: boolean;
  onAfterOpenRequest?: () => void;
}) {
  return (
    <GalleryCore
      layout="slider"
      fullscreenItems={[
        {
          kind: "image",
          src: "https://example.com/fullscreen-alpha.jpg",
          alt: "Alpha",
        },
      ]}
    >
      <OpenButton onAfterOpenRequest={onAfterOpenRequest} />
      <FullscreenAddon mountStrategy={mountStrategy} lazyLoad={lazyLoad} />
    </GalleryCore>
  );
}

function mount(node: React.ReactNode): Mounted {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  React.act(() => {
    root.render(node);
  });

  return { container, root };
}

function unmount(mounted: Mounted) {
  React.act(() => {
    mounted.root.unmount();
  });
  mounted.container.remove();
}

function fullscreenRoot() {
  return document.querySelector('[data-rmg-fs-root="true"]');
}

async function clickOpen(container: HTMLElement) {
  const button = container.querySelector("button");
  if (!button) throw new Error("missing open button");

  await React.act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
  });
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  (globalThis as any).ResizeObserver = ResizeObserverStub;

  window.requestAnimationFrame ??= ((cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(performance.now()), 0)) as any;
  window.cancelAnimationFrame ??= ((id: number) =>
    window.clearTimeout(id)) as any;

  Object.defineProperty(HTMLImageElement.prototype, "decode", {
    configurable: true,
    value: vi.fn(() => Promise.resolve()),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

afterAll(() => {
  delete (globalThis as any).ResizeObserver;
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

describe("fullscreen mountStrategy", () => {
  test("keeps the closed fullscreen root mounted by default", () => {
    const mounted = mount(<TestGallery />);

    expect(fullscreenRoot()).not.toBeNull();

    unmount(mounted);
  });

  test("removes the closed fullscreen root when mountStrategy is open", () => {
    const mounted = mount(<TestGallery mountStrategy="open" />);

    expect(fullscreenRoot()).toBeNull();

    unmount(mounted);
  });

  test("opens through GalleryCore while the open strategy view is unmounted", async () => {
    const mounted = mount(<TestGallery mountStrategy="open" />);

    expect(fullscreenRoot()).toBeNull();

    await clickOpen(mounted.container);

    expect(fullscreenRoot()).not.toBeNull();

    unmount(mounted);
  });

  test("does not show the intro pending spinner during an open strategy request", async () => {
    const mounted = mount(<TestGallery mountStrategy="open" lazyLoad />);

    await clickOpen(mounted.container);

    expect(fullscreenRoot()).not.toBeNull();
    expect(
      document.querySelector('[data-rmg-fs-intro-spinner="true"]')
    ).toBeNull();
    expect(
      document.querySelector('[data-rmg-fs-intro-spinner-layer="true"]')
    ).toBeNull();
    expect(document.querySelector("[data-rmg-image-spinner]")).toBeNull();

    unmount(mounted);
  });
});
