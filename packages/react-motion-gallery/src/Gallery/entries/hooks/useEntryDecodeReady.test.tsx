// @vitest-environment jsdom

import * as React from "react";
import { createRoot } from "react-dom/client";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { useEntryDecodeReady } from "./useEntryDecodeReady";

function Probe({
  entries,
  onRender,
}: {
  entries: Array<{ id: string; media?: Array<{ kind: "image"; src: string }> }>;
  onRender: (decodedReady: boolean[]) => void;
}) {
  const { decodedReady } = useEntryDecodeReady(true, entries, [false]);
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
});
