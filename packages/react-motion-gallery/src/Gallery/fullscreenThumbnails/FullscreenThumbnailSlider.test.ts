// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { createFullscreenSliderSub } from "../fullscreen/fullscreenSliderSub";
import type { FullscreenThumbnailBridge } from "./types";

const thumbnailMockState = vi.hoisted(() => ({
  latestProps: null as any,
}));

vi.mock("../thumbnails", async () => {
  const React = await import("react");

  return {
    default: (props: any) => {
      thumbnailMockState.latestProps = props;
      return React.createElement(
        "div",
        { "data-rmg-testid": "mock-thumbnail-slider" },
        props.children
      );
    },
  };
});

import FullscreenThumbnailSlider, {
  createFullscreenThumbnailOptions,
  resolveFullscreenThumbnailClosedTransform,
} from "./FullscreenThumbnailSlider";

const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

function makeItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    thumbSrc: `/thumb-${index}.jpg`,
    alt: `Thumb ${index}`,
  }));
}

function makeBridge(args: {
  mountEl: HTMLDivElement;
  fsSub: ReturnType<typeof createFullscreenSliderSub>;
  visible?: boolean;
  invisible?: boolean;
}): FullscreenThumbnailBridge {
  return {
    mountEl: args.mountEl,
    fsSub: args.fsSub,
    visible: args.visible ?? true,
    invisible: args.invisible ?? false,
    direction: "ltr",
    registerLayout: vi.fn(),
    clearLayout: vi.fn(),
  };
}

function renderFullscreenThumbnailSlider(args?: {
  fsSub?: ReturnType<typeof createFullscreenSliderSub>;
  initialIndex?: number;
  visible?: boolean;
  invisible?: boolean;
}) {
  const container = document.createElement("div");
  const mountEl = document.createElement("div");
  document.body.append(container, mountEl);

  const root = createRoot(container);
  const fsSub =
    args?.fsSub ?? createFullscreenSliderSub(args?.initialIndex ?? 0);

  const render = (next?: { visible?: boolean; invisible?: boolean }) => {
    const bridge = makeBridge({
      mountEl,
      fsSub,
      visible: next?.visible ?? args?.visible ?? true,
      invisible: next?.invisible ?? args?.invisible ?? false,
    });

    React.act(() => {
      root.render(
        React.createElement(FullscreenThumbnailSlider, {
          bridge,
          items: makeItems(5),
          position: "bottom",
          fadeDurationMs: 120,
        })
      );
    });
  };

  render();

  return {
    container,
    fsSub,
    mountEl,
    root,
    render,
    unmount() {
      React.act(() => {
        root.unmount();
      });
      container.remove();
      mountEl.remove();
    },
  };
}

function getPortalWrapper(mountEl: HTMLDivElement) {
  const wrapper = mountEl.firstElementChild;
  expect(wrapper).toBeInstanceOf(HTMLElement);
  return wrapper as HTMLElement;
}

async function flushInitialOpenReadyFrames() {
  await React.act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  });
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

  globalThis.requestAnimationFrame =
    originalRequestAnimationFrame ??
    ((callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 16));
  globalThis.cancelAnimationFrame =
    originalCancelAnimationFrame ??
    ((id: number) => window.clearTimeout(id));
});

afterEach(() => {
  thumbnailMockState.latestProps = null;
  document.body.innerHTML = "";
});

afterAll(() => {
  if (originalRequestAnimationFrame) {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  } else {
    delete (globalThis as any).requestAnimationFrame;
  }

  if (originalCancelAnimationFrame) {
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  } else {
    delete (globalThis as any).cancelAnimationFrame;
  }

  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

describe("fullscreen thumbnail slider motion", () => {
  test("uses position-aware closed transforms", () => {
    expect(resolveFullscreenThumbnailClosedTransform("left")).toBe(
      "translateX(-8px)"
    );
    expect(resolveFullscreenThumbnailClosedTransform("right")).toBe(
      "translateX(8px)"
    );
    expect(resolveFullscreenThumbnailClosedTransform("top")).toBe(
      "translateY(-8px)"
    );
    expect(resolveFullscreenThumbnailClosedTransform("bottom")).toBe(
      "translateY(8px)"
    );
  });

  test("forwards virtualization into thumbnail options", () => {
    const virtualization = { enabled: true, overscan: 3, threshold: 18 };
    const options = createFullscreenThumbnailOptions({
      position: "bottom",
      virtualization,
    });

    expect(options.virtualization).toBe(virtualization);
  });

  test("forwards fadeOnSync into thumbnail scroll options", () => {
    const fadeOnSync = { enabled: true, minDistance: 3 };
    const options = createFullscreenThumbnailOptions({
      position: "bottom",
      fadeOnSync,
    });

    expect(options.scroll?.fadeOnSync).toBe(fadeOnSync);
  });

  test("keeps the rail hidden until the initial open snap is ready", async () => {
    const view = renderFullscreenThumbnailSlider({ initialIndex: 3 });
    const wrapper = getPortalWrapper(view.mountEl);

    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.pointerEvents).toBe("none");
    expect(thumbnailMockState.latestProps.indexChannel.get()).toMatchObject({
      index: 3,
      mode: "instant",
    });

    React.act(() => {
      thumbnailMockState.latestProps.onReadyChange(false);
    });

    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.pointerEvents).toBe("none");

    React.act(() => {
      thumbnailMockState.latestProps.onReadyChange(true);
    });

    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.pointerEvents).toBe("none");

    await flushInitialOpenReadyFrames();

    expect(wrapper.style.opacity).toBe("1");
    expect(wrapper.style.pointerEvents).toBe("auto");

    view.unmount();
  });

  test("keeps later fullscreen index sync animated after initial readiness", () => {
    const view = renderFullscreenThumbnailSlider({ initialIndex: 1 });

    React.act(() => {
      thumbnailMockState.latestProps.onReadyChange(true);
    });

    expect(thumbnailMockState.latestProps.indexChannel.get()).toMatchObject({
      index: 1,
      mode: "instant",
    });

    React.act(() => {
      view.fsSub.setLocalIndex(4);
    });

    expect(thumbnailMockState.latestProps.indexChannel.get()).toMatchObject({
      index: 4,
      mode: "animated",
    });

    view.unmount();
  });

  test("forwards thumbnail crossfade metadata to fullscreen requests", () => {
    const view = renderFullscreenThumbnailSlider({ initialIndex: 1 });
    const onRequest = vi.fn();
    const cleanup = view.fsSub.onRequest(onRequest);

    React.act(() => {
      thumbnailMockState.latestProps.onThumbnailClick(4, {
        transition: "crossfade",
        crossfade: {
          durationMs: 240,
          easing: "linear",
        },
      });
    });

    expect(onRequest).toHaveBeenCalledWith({
      type: "requestSet",
      index: 4,
      mode: "animated",
      meta: {
        source: "thumbnail",
        transition: "crossfade",
        crossfade: {
          durationMs: 240,
          easing: "linear",
        },
      },
    });

    cleanup();
    view.unmount();
  });

  test("keeps a ready rail hidden while the bridge is invisible", async () => {
    const view = renderFullscreenThumbnailSlider({
      initialIndex: 2,
      invisible: true,
    });
    const wrapper = getPortalWrapper(view.mountEl);

    React.act(() => {
      thumbnailMockState.latestProps.onReadyChange(true);
    });

    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.pointerEvents).toBe("none");

    await flushInitialOpenReadyFrames();

    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.pointerEvents).toBe("none");

    view.render({ invisible: false });

    expect(wrapper.style.opacity).toBe("1");
    expect(wrapper.style.pointerEvents).toBe("auto");

    view.unmount();
  });
});
