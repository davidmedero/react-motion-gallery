// @vitest-environment jsdom

import * as React from "react";
import { createRoot } from "react-dom/client";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { useEntryDecodeReady } from "./useEntryDecodeReady";

function Probe({
  entries,
  onRender,
}: {
  entries: Array<{
    id: string;
    media?: Array<{ kind: "image"; src: string } | { kind: "video"; src: string; poster: string }>;
  }>;
  onRender: (decodedReady: boolean[]) => void;
}) {
  const { decodedReady } = useEntryDecodeReady(true, entries, [false]);
  onRender(decodedReady);
  return null;
}

function DynamicInViewProbe({
  inView,
  onRender,
}: {
  inView: boolean;
  onRender: (decodedReady: boolean[]) => void;
}) {
  const { decodedReady } = useEntryDecodeReady(
    true,
    [{ id: "entry-dynamic", media: [{ kind: "image", src: "/slow.jpg" }] }],
    [inView]
  );
  onRender(decodedReady);
  return null;
}

function PriorityProbe({
  onRender,
}: {
  onRender: (decodedReady: boolean[]) => void;
}) {
  const { decodedReady } = useEntryDecodeReady(
    true,
    [
      {
        id: "entry-priority",
        media: [
          { kind: "image", src: "/first.jpg" },
          { kind: "image", src: "/second.jpg" },
        ],
      },
    ],
    [true],
    { priority: "first" }
  );
  onRender(decodedReady);
  return null;
}

function VideoPosterPriorityProbe({
  onRender,
}: {
  onRender: (decodedReady: boolean[]) => void;
}) {
  const { decodedReady } = useEntryDecodeReady(
    true,
    [
      {
        id: "entry-video-priority",
        media: [
          { kind: "video", src: "/clip.mp4", poster: "/poster.jpg" },
          { kind: "image", src: "/fallback.jpg" },
        ],
      },
    ],
    [true],
    { priority: "first" }
  );
  onRender(decodedReady);
  return null;
}

describe("useEntryDecodeReady", () => {
  beforeAll(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  });

  test("does not expose stale decoded state when entry identities change", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const renders: boolean[][] = [];

    await React.act(async () => {
      root.render(<Probe entries={[{ id: "entry-a" }]} onRender={(state) => renders.push(state)} />);
    });

    expect(renders.at(-1)).toEqual([true]);

    await React.act(async () => {
      root.render(
        <Probe
          entries={[{ id: "entry-b", media: [{ kind: "image", src: "/b.jpg" }] }]}
          onRender={(state) => renders.push(state)}
        />
      );
    });

    expect(renders.at(-1)).toEqual([false]);

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("marks entries ready after priority images and decodes the rest in the background", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const previousImage = globalThis.Image;
    const decodedUrls: string[] = [];
    const decodeResolvers: Array<() => void> = [];
    const renders: boolean[][] = [];

    class MockImage {
      decoding = "auto";
      private currentSrc = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(value: string) {
        this.currentSrc = value;
      }

      get src() {
        return this.currentSrc;
      }

      decode() {
        decodedUrls.push(this.currentSrc);
        return new Promise<void>((resolve) => {
          decodeResolvers.push(resolve);
        });
      }
    }

    vi.stubGlobal("Image", MockImage);

    try {
      await React.act(async () => {
        root.render(<PriorityProbe onRender={(state) => renders.push(state)} />);
      });

      expect(decodedUrls).toEqual(["/first.jpg"]);
      expect(renders.at(-1)).toEqual([false]);

      await React.act(async () => {
        decodeResolvers[0]?.();
        await Promise.resolve();
      });

      expect(renders.some((state) => state[0] === true)).toBe(true);
      expect(decodedUrls).toEqual(["/first.jpg", "/second.jpg"]);

      await React.act(async () => {
        decodeResolvers[1]?.();
        await Promise.resolve();
      });
    } finally {
      vi.stubGlobal("Image", previousImage);
      await React.act(async () => {
        root.unmount();
      });
      rootEl.remove();
    }
  });

  test("aborts pending predecode when an entry leaves view and restarts on re-entry", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const previousImage = globalThis.Image;
    const decodedUrls: string[] = [];
    const instances: Array<{ src: string }> = [];
    const renders: boolean[][] = [];

    class MockImage {
      decoding = "auto";
      private currentSrc = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        instances.push(this);
      }

      set src(value: string) {
        this.currentSrc = value;
      }

      get src() {
        return this.currentSrc;
      }

      decode() {
        decodedUrls.push(this.currentSrc);
        return new Promise<void>(() => undefined);
      }
    }

    vi.stubGlobal("Image", MockImage);

    try {
      await React.act(async () => {
        root.render(
          <DynamicInViewProbe inView onRender={(state) => renders.push(state)} />
        );
      });

      expect(decodedUrls).toEqual(["/slow.jpg"]);
      expect(instances[0]?.src).toBe("/slow.jpg");
      expect(renders.at(-1)).toEqual([false]);

      await React.act(async () => {
        root.render(
          <DynamicInViewProbe inView={false} onRender={(state) => renders.push(state)} />
        );
        await Promise.resolve();
      });

      expect(instances[0]?.src).toBe("");

      await React.act(async () => {
        root.render(
          <DynamicInViewProbe inView onRender={(state) => renders.push(state)} />
        );
      });

      expect(decodedUrls).toEqual(["/slow.jpg", "/slow.jpg"]);
      expect(instances[1]?.src).toBe("/slow.jpg");
      expect(renders.at(-1)).toEqual([false]);
    } finally {
      vi.stubGlobal("Image", previousImage);
      await React.act(async () => {
        root.unmount();
      });
      rootEl.remove();
    }
  });

  test("uses video posters as ordered priority decode targets", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const previousImage = globalThis.Image;
    const decodedUrls: string[] = [];
    const decodeResolvers: Array<() => void> = [];
    const renders: boolean[][] = [];

    class MockImage {
      decoding = "auto";
      private currentSrc = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(value: string) {
        this.currentSrc = value;
      }

      get src() {
        return this.currentSrc;
      }

      decode() {
        decodedUrls.push(this.currentSrc);
        return new Promise<void>((resolve) => {
          decodeResolvers.push(resolve);
        });
      }
    }

    vi.stubGlobal("Image", MockImage);

    try {
      await React.act(async () => {
        root.render(
          <VideoPosterPriorityProbe onRender={(state) => renders.push(state)} />
        );
      });

      expect(decodedUrls).toEqual(["/poster.jpg"]);
      expect(renders.at(-1)).toEqual([false]);

      await React.act(async () => {
        decodeResolvers[0]?.();
        await Promise.resolve();
      });

      expect(renders.some((state) => state[0] === true)).toBe(true);
      expect(decodedUrls).toEqual(["/poster.jpg", "/fallback.jpg"]);

      await React.act(async () => {
        decodeResolvers[1]?.();
        await Promise.resolve();
      });
    } finally {
      vi.stubGlobal("Image", previousImage);
      await React.act(async () => {
        root.unmount();
      });
      rootEl.remove();
    }
  });
});
