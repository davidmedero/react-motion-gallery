// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from "vitest";

import {
  createViewportTransformCropper,
  intersectViewportCropRects,
  resolveTransitionProxyInnerLayout,
  resolveTransitionProxyRaster,
  resolveViewportCropTransforms,
  warmTransitionImage,
} from "./transformTransition";

function rect(left: number, top: number, width: number, height: number) {
  return new DOMRect(left, top, width, height);
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("viewport transform crop", () => {
  test("keeps content in viewport coordinates while clipping all four edges", () => {
    const resolved = resolveViewportCropTransforms(
      rect(100, 50, 400, 300),
      1000,
      700
    );

    expect(resolved.crop).toMatchObject({
      left: 100,
      top: 50,
      right: 500,
      bottom: 350,
    });
    expect(resolved.leading).toBe("translate3d(100px, 50px, 0)");
    expect(resolved.trailing).toBe("translate3d(-600px, -400px, 0)");
    expect(resolved.content).toBe("translate3d(500px, 350px, 0)");
    expect(resolved.translationSum).toEqual({ x: 0, y: 0 });
  });

  test("intersects ancestor crops and clamps them to the viewport", () => {
    const crop = intersectViewportCropRects(
      [
        rect(-40, 20, 700, 600),
        rect(80, -20, 500, 500),
        rect(100, 70, 700, 700),
      ],
      1000,
      700
    );

    expect(crop).toMatchObject({
      left: 100,
      top: 70,
      right: 580,
      bottom: 480,
      width: 480,
      height: 410,
    });
  });

  test("creates transform-only overflow layers", () => {
    const cropper = createViewportTransformCropper({
      startRect: rect(100, 50, 400, 300),
      viewportWidth: 1000,
      viewportHeight: 700,
      zIndex: 42,
      dataAttribute: "data-rmg-test-cropper",
    });

    document.body.appendChild(cropper.root);
    cropper.setTransition(300, "linear");
    cropper.setRect(rect(0, 0, 1000, 700));

    expect(cropper.root.dataset.rmgTestCropper).toBe("true");
    expect(cropper.root.style.clipPath).toBe("");
    expect(cropper.root.style.zIndex).toBe("42");

    const leading = cropper.root.firstElementChild as HTMLElement;
    const trailing = leading.firstElementChild as HTMLElement;
    const content = trailing.firstElementChild as HTMLElement;

    expect(leading.style.overflow).toBe("hidden");
    expect(trailing.style.overflow).toBe("hidden");
    expect(leading.style.transition).toBe("transform 300ms linear");
    expect(trailing.style.transition).toBe("transform 300ms linear");
    expect(content.style.transition).toBe("transform 300ms linear");
    expect(leading.style.transform).toBe("translate3d(0px, 0px, 0)");
    expect(trailing.style.transform).toBe("translate3d(0px, 0px, 0)");
    expect(content.style.transform).toBe("translate3d(0px, 0px, 0)");
  });
});

describe("transition proxy sizing", () => {
  test("caps the CSS raster by device-pixel budget while preserving aspect", () => {
    const raster = resolveTransitionProxyRaster({
      sourceWidth: 2400,
      sourceHeight: 1500,
      startRect: rect(0, 0, 1200, 750),
      endRect: rect(20, 40, 240, 150),
      devicePixelRatio: 3,
    });

    expect(raster.width).toBe(683);
    expect(raster.height).toBe(427);
    expect(raster.width / raster.height).toBeCloseTo(2400 / 1500, 2);
    expect(raster.cssLongEdge).toBeCloseTo(2048 / 3);
  });

  test.each([
    { proxyWidth: 600, proxyHeight: 450, expectedHeight: 187.5 },
    {
      proxyWidth: 450,
      proxyHeight: 600,
      expectedHeight: 1000 / 3,
    },
  ])(
    "maps a 250px inner basis onto a $proxyWidth x $proxyHeight proxy",
    ({ proxyWidth, proxyHeight, expectedHeight }) => {
      const inner = resolveTransitionProxyInnerLayout({
        proxyWidth,
        proxyHeight,
      });

      expect(inner.width).toBe(250);
      expect(inner.height).toBeCloseTo(expectedHeight);
      expect(inner.width * inner.scale).toBeCloseTo(proxyWidth);
      expect(inner.height * inner.scale).toBeCloseTo(proxyHeight);
    }
  );

  test("waits for decode and a minimum paint window before motion", async () => {
    vi.useFakeTimers();
    const image = document.createElement("img");
    let resolveDecode: (() => void) | null = null;
    image.decode = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDecode = resolve;
        })
    );
    let ready = false;

    const warming = warmTransitionImage(image).then(() => {
      ready = true;
    });

    await Promise.resolve();
    resolveDecode?.();
    await Promise.resolve();
    vi.advanceTimersByTime(49);
    await Promise.resolve();
    expect(ready).toBe(false);

    vi.advanceTimersByTime(1);
    await warming;
    expect(ready).toBe(true);
  });

  test("still reserves a paint window when decode is unavailable", async () => {
    vi.useFakeTimers();
    const image = document.createElement("img");
    Object.defineProperty(image, "decode", {
      configurable: true,
      value: undefined,
    });
    let ready = false;

    const warming = warmTransitionImage(image).then(() => {
      ready = true;
    });

    vi.advanceTimersByTime(49);
    await Promise.resolve();
    expect(ready).toBe(false);

    vi.advanceTimersByTime(1);
    await warming;
    expect(ready).toBe(true);
  });

  test("contains a synchronous decode failure and still waits to paint", async () => {
    vi.useFakeTimers();
    const image = document.createElement("img");
    image.decode = vi.fn(() => {
      throw new Error("decode failed");
    });

    const warming = warmTransitionImage(image);
    await Promise.resolve();
    vi.advanceTimersByTime(50);

    await expect(warming).resolves.toBeUndefined();
  });

  test("stops waiting when decode exceeds the 250ms ceiling", async () => {
    vi.useFakeTimers();
    const image = document.createElement("img");
    image.decode = vi.fn(() => new Promise<void>(() => {}));
    let ready = false;

    const warming = warmTransitionImage(image).then(() => {
      ready = true;
    });

    await Promise.resolve();
    vi.advanceTimersByTime(249);
    await Promise.resolve();
    expect(ready).toBe(false);

    vi.advanceTimersByTime(1);
    await warming;
    expect(ready).toBe(true);
    expect(image.decode).toHaveBeenCalledTimes(1);
  });

});
