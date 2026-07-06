import { describe, expect, test } from "vitest";

import { boundsForCurrent } from "./boundsForCurrent";

function makeRect(args: {
  left?: number;
  top?: number;
  width: number;
  height: number;
}): DOMRect {
  const { left = 0, top = 0, width, height } = args;

  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("boundsForCurrent", () => {
  test("keeps max-sized centered images bounded from their layout box", () => {
    const img = {
      tagName: "img",
      offsetWidth: 720,
      offsetHeight: 360,
    } as unknown as HTMLImageElement;

    const mediaViewport = {
      children: [img],
      matches: (selector: string) => selector === "[data-rmg-fs-media-viewport='true']",
      querySelector: () => null,
      getBoundingClientRect: () => makeRect({ width: 720, height: 675 }),
    } as unknown as HTMLElement;

    const result = boundsForCurrent({
      scale: 2,
      imgW: 720,
      imgH: 360,
      currentImageEl: mediaViewport,
    });

    expect(result.y.min).toBe(-202.5);
    expect(result.y.max).toBe(-157.5);
  });

  test("scales object-fit offsets when the image element fills the media viewport", () => {
    const img = {
      tagName: "img",
      offsetWidth: 720,
      offsetHeight: 675,
    } as unknown as HTMLImageElement;

    const mediaViewport = {
      children: [img],
      matches: (selector: string) => selector === "[data-rmg-fs-media-viewport='true']",
      querySelector: () => null,
      getBoundingClientRect: () => makeRect({ width: 720, height: 675 }),
    } as unknown as HTMLElement;

    const result = boundsForCurrent({
      scale: 2,
      imgW: 720,
      imgH: 360,
      currentImageEl: mediaViewport,
    });

    expect(result.y.min).toBe(-360);
    expect(result.y.max).toBe(-315);
  });

  test("uses the fullscreen media viewport width when the outer media box collapses", () => {
    const mediaViewport = {
      matches: (selector: string) => selector === "[data-rmg-fs-media-viewport='true']",
      querySelector: () => null,
      getBoundingClientRect: () => makeRect({ width: 720, height: 900 }),
    } as unknown as HTMLElement;

    const mediaContainer = {
      matches: () => false,
      querySelector: (selector: string) =>
        selector === "[data-rmg-fs-media-viewport='true']" ? mediaViewport : null,
      getBoundingClientRect: () => makeRect({ width: 240, height: 900 }),
    } as unknown as HTMLElement;

    const result = boundsForCurrent({
      scale: 2,
      imgW: 720,
      imgH: 900,
      currentImageEl: mediaContainer,
      captionW: 720,
      captionPlacement: "right",
    });

    expect(result.x.min).toBe(0);
    expect(result.x.max).toBe(0);
  });

  test("uses the fullscreen media viewport height when the outer media box collapses", () => {
    const mediaViewport = {
      matches: (selector: string) => selector === "[data-rmg-fs-media-viewport='true']",
      querySelector: () => null,
      getBoundingClientRect: () => makeRect({ width: 900, height: 675 }),
    } as unknown as HTMLElement;

    const mediaContainer = {
      matches: () => false,
      querySelector: (selector: string) =>
        selector === "[data-rmg-fs-media-viewport='true']" ? mediaViewport : null,
      getBoundingClientRect: () => makeRect({ width: 900, height: 240 }),
    } as unknown as HTMLElement;

    const result = boundsForCurrent({
      scale: 2,
      imgW: 900,
      imgH: 675,
      currentImageEl: mediaContainer,
      captionH: 225,
      captionPlacement: "bottom",
    });

    expect(result.y.min).toBe(-450);
    expect(result.y.max).toBe(0);
  });

  test("expands the virtual visible area from explicit reserved edges", () => {
    const mediaViewport = {
      matches: (selector: string) => selector === "[data-rmg-fs-media-viewport='true']",
      querySelector: () => null,
      getBoundingClientRect: () => makeRect({ width: 720, height: 675 }),
    } as unknown as HTMLElement;

    const mediaContainer = {
      matches: () => false,
      querySelector: (selector: string) =>
        selector === "[data-rmg-fs-media-viewport='true']" ? mediaViewport : null,
      getBoundingClientRect: () => makeRect({ width: 720, height: 675 }),
    } as unknown as HTMLElement;

    const result = boundsForCurrent({
      scale: 2,
      imgW: 720,
      imgH: 675,
      currentImageEl: mediaContainer,
      reservedRight: 360,
      reservedBottom: 225,
    });

    expect(result.x.min).toBe(-360);
    expect(result.x.max).toBe(0);
    expect(result.y.min).toBe(-450);
    expect(result.y.max).toBe(0);
  });
});
