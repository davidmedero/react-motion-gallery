// @vitest-environment jsdom

import { describe, expect, test } from "vitest";

import {
  isFullscreenPlyrLayoutStable,
  shouldRevealFullscreenPlyrLayout,
} from "./renderFullscreenSlides";

function mockRect(
  el: HTMLElement,
  width: number,
  height: number,
  left = 0,
  top = 0
) {
  el.getBoundingClientRect = () =>
    ({
      x: left,
      y: top,
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      toJSON: () => ({}),
    }) as DOMRect;
}

function createPlyrHost(args: {
  hostWidth?: number;
  hostHeight?: number;
  rootWidth?: number;
  rootHeight?: number;
  wrapperWidth?: number;
  wrapperHeight?: number;
}) {
  const host = document.createElement("div");
  const root = document.createElement("div");
  const wrapper = document.createElement("div");

  root.className = "plyr plyr--full-ui";
  wrapper.className = "plyr__video-wrapper";

  host.appendChild(root);
  root.appendChild(wrapper);

  mockRect(host, args.hostWidth ?? 944, args.hostHeight ?? 531);
  mockRect(root, args.rootWidth ?? 944, args.rootHeight ?? 531);
  mockRect(wrapper, args.wrapperWidth ?? 944, args.wrapperHeight ?? 531);

  return { host, root, wrapper };
}

describe("fullscreen Plyr layout reveal gate", () => {
  test("rejects the top-built partial Plyr wrapper before showing live video", () => {
    const { host } = createPlyrHost({
      hostWidth: 944,
      hostHeight: 531,
      rootWidth: 944,
      rootHeight: 531,
      wrapperWidth: 944,
      wrapperHeight: 150,
    });

    expect(isFullscreenPlyrLayoutStable(host, 16 / 9)).toBe(false);
  });

  test("accepts a built Plyr wrapper once it fills the fullscreen player host", () => {
    const { host } = createPlyrHost({
      hostWidth: 944,
      hostHeight: 531,
      rootWidth: 944,
      rootHeight: 531,
      wrapperWidth: 944,
      wrapperHeight: 531,
    });

    expect(isFullscreenPlyrLayoutStable(host, 16 / 9)).toBe(true);
  });

  test("does not reveal the raw video element before Plyr builds its surface", () => {
    const host = document.createElement("div");
    const rawVideo = document.createElement("video");
    rawVideo.className = "plyr";
    host.appendChild(rawVideo);

    mockRect(host, 944, 531);
    mockRect(rawVideo, 944, 531);

    expect(isFullscreenPlyrLayoutStable(host, 16 / 9)).toBe(false);
  });

  test("keeps the live player hidden during partial layout until the fallback expires", () => {
    const { host } = createPlyrHost({
      hostWidth: 944,
      hostHeight: 531,
      rootWidth: 944,
      rootHeight: 531,
      wrapperWidth: 944,
      wrapperHeight: 150,
    });

    expect(
      shouldRevealFullscreenPlyrLayout({
        hostEl: host,
        ratio: 16 / 9,
        elapsedMs: 120,
        timeoutMs: 900,
      })
    ).toBe(false);

    expect(
      shouldRevealFullscreenPlyrLayout({
        hostEl: host,
        ratio: 16 / 9,
        elapsedMs: 901,
        timeoutMs: 900,
      })
    ).toBe(true);
  });
});
