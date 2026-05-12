import { describe, expect, test } from "vitest";

import {
  buildSliderScrollSnaps,
  fitsWithinSliderViewport,
  getSliderCenterOffset,
  resolveSliderMeasuredSize,
  roundSliderLayoutMetric,
  resolveSliderContentSpan,
  shouldEnableSliderLoop,
  SLIDER_LAYOUT_EPSILON,
} from "./layoutStability";

describe("slider layout stability helpers", () => {
  test("treats tiny viewport deltas as fitting", () => {
    expect(fitsWithinSliderViewport(320.4, 320)).toBe(true);
    expect(fitsWithinSliderViewport(320 + SLIDER_LAYOUT_EPSILON, 320)).toBe(true);
    expect(fitsWithinSliderViewport(320.51, 320)).toBe(false);
  });

  test("uses the same threshold for loop enablement", () => {
    expect(
      shouldEnableSliderLoop({
        loop: true,
        itemCount: 3,
        span: 640.4,
        viewport: 640,
      })
    ).toBe(false);

    expect(
      shouldEnableSliderLoop({
        loop: true,
        itemCount: 3,
        span: 640.75,
        viewport: 640,
      })
    ).toBe(true);
  });

  test("rounds small geometry jitter out of signatures", () => {
    expect(roundSliderLayoutMetric(319.994)).toBe(319.99);
    expect(roundSliderLayoutMetric(319.995)).toBe(320);
  });

  test("prefers child margin extent when descendant margins overflow the slide shell", () => {
    expect(
      resolveSliderMeasuredSize({
        rectSize: 550,
        scale: 1,
        offsetSize: 550,
        marginExtentSize: 590,
      })
    ).toBe(590);
  });

  test("normalizes scaled rects before comparing them with intrinsic layout size", () => {
    expect(
      resolveSliderMeasuredSize({
        rectSize: 632.5,
        scale: 1.15,
        offsetSize: 550,
        marginExtentSize: 590,
      })
    ).toBe(590);
  });

  test("measures content span from the resolved loop state", () => {
    expect(
      resolveSliderContentSpan({
        baseSpan: 640,
        gap: 24,
        shouldLoop: false,
      })
    ).toBe(640);

    expect(
      resolveSliderContentSpan({
        baseSpan: 640,
        gap: 24,
        shouldLoop: true,
      })
    ).toBe(664);
  });

  test("recomputes center offsets from the live viewport width", () => {
    expect(
      getSliderCenterOffset({
        viewport: 900,
        alignSize: 500,
        centerAlign: true,
      })
    ).toBe(200);

    expect(
      getSliderCenterOffset({
        viewport: 700,
        alignSize: 500,
        centerAlign: true,
      })
    ).toBe(100);
  });

  test("builds fresh center-aligned snap positions after resize", () => {
    expect(
      buildSliderScrollSnaps({
        targets: [0, 520],
        alignSizes: [500, 500],
        viewport: 900,
        centerAlign: true,
      })
    ).toEqual([200, -320]);

    expect(
      buildSliderScrollSnaps({
        targets: [0, 520],
        alignSizes: [500, 500],
        viewport: 700,
        centerAlign: true,
      })
    ).toEqual([100, -420]);
  });
});
