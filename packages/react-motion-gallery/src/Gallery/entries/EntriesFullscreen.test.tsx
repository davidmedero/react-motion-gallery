// @vitest-environment jsdom

import * as React from "react";
import { createRoot } from "react-dom/client";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const coreMock = vi.hoisted(() => ({
  requestFullscreenOpen: vi.fn(),
  registerFullscreenAdapter: vi.fn(),
  expandableImageRefs: { current: [] as Array<HTMLImageElement | null> },
  registerExpandableImage: vi.fn((index: number, node: HTMLElement | null) => {
    if (!node) {
      coreMock.expandableImageRefs.current[index] = null;
      return;
    }

    coreMock.expandableImageRefs.current[index] =
      node instanceof HTMLImageElement
        ? node
        : node.querySelector<HTMLImageElement>("img");
  }),
}));

vi.mock("../core", () => ({
  useOptionalGalleryCore: () => ({
    effectiveBreakpoints: {},
    requestFullscreenOpen: coreMock.requestFullscreenOpen,
    registerFullscreenAdapter: coreMock.registerFullscreenAdapter,
    expandableImageRefs: coreMock.expandableImageRefs,
    registerExpandableImage: coreMock.registerExpandableImage,
  }),
}));

vi.mock("./hooks/useEntryInView", () => ({
  useEntryInView: () => ({
    nearView: [true],
    inView: [true],
    everInView: [true],
    setEntryRef: () => () => undefined,
  }),
}));

vi.mock("../shared/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => false,
}));

import { Entries } from "./index";

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 0)
  );
  vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
    window.clearTimeout(handle)
  );
});

beforeEach(() => {
  coreMock.requestFullscreenOpen.mockClear();
  coreMock.registerFullscreenAdapter.mockClear();
  coreMock.registerExpandableImage.mockClear();
  coreMock.expandableImageRefs.current = [];
});

describe("Entries fullscreen", () => {
  test("opens video media through the fullscreen fade path", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);

    await React.act(async () => {
      root.render(
        <Entries
          entries={{
            items: [
              {
                id: "video-entry",
                media: [
                  {
                    kind: "video",
                    src: "/review.mp4",
                    poster: "/review-poster.jpg",
                    alt: "Review video",
                  } as any,
                ],
              },
            ],
            loading: { enabled: false },
            render: {
              media: ({ media }) => (
                <figure>
                  <img src={(media as any).poster} alt={(media as any).alt} />
                </figure>
              ),
            },
          }}
          fullscreen={{ enabled: true }}
          renderMediaContainer={({ mediaNodes }) => <div>{mediaNodes}</div>}
        />
      );
    });

    rootEl.querySelector<HTMLImageElement>('img[alt="Review video"]')?.click();

    expect(coreMock.requestFullscreenOpen).toHaveBeenCalledWith({
      source: "entries",
      index: 0,
      image: null,
      event: undefined,
    });

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("settles owner sliders before requesting fullscreen", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const calls: string[] = [];
    const settleForFullscreenOpen = vi.fn(() => {
      calls.push("settle");
    });
    const entrySliderRefs = {
      current: [{ _settleForFullscreenOpen: settleForFullscreenOpen } as any],
    };

    coreMock.requestFullscreenOpen.mockImplementationOnce(() => {
      calls.push("request");
    });

    await React.act(async () => {
      root.render(
        <Entries
          entrySliderRefs={entrySliderRefs}
          entries={{
            items: [
              {
                id: "image-entry",
                media: [
                  {
                    kind: "image",
                    src: "/review.jpg",
                    alt: "Review image",
                  } as any,
                ],
              },
            ],
            loading: { enabled: false },
            render: {
              media: ({ media }) => (
                <figure>
                  <img src={(media as any).src} alt={(media as any).alt} />
                </figure>
              ),
            },
          }}
          fullscreen={{ enabled: true }}
          renderMediaContainer={({ mediaNodes }) => <div>{mediaNodes}</div>}
        />
      );
    });

    rootEl.querySelector<HTMLImageElement>('img[alt="Review image"]')?.click();

    expect(calls).toEqual(["settle", "request"]);
    expect(settleForFullscreenOpen).toHaveBeenCalledTimes(1);

    const adapter = coreMock.registerFullscreenAdapter.mock.calls.find(
      ([source]) => source === "entries"
    )?.[1] as { syncBeforeOpen?: (index: number) => void } | undefined;

    settleForFullscreenOpen.mockClear();
    adapter?.syncBeforeOpen?.(0);

    expect(settleForFullscreenOpen).toHaveBeenCalledTimes(1);

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });
});
