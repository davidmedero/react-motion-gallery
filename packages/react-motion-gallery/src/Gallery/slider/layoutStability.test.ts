import { describe, expect, test } from "vitest";

import {
  buildSliderScrollSnaps,
  fitsWithinSliderViewport,
  getSliderCenterOffset,
  mergeDuplicateContainedSliderPages,
  resolveSliderGroupCells,
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

  test("resolves slider groupCells modes", () => {
    expect(
      resolveSliderGroupCells({
        total: 8,
        groupCells: false,
        cellsPerSlide: 3,
      })
    ).toEqual({ enabled: false, fixedCount: null });

    expect(
      resolveSliderGroupCells({
        total: 8,
        groupCells: true,
      })
    ).toEqual({ enabled: true, fixedCount: null });

    expect(
      resolveSliderGroupCells({
        total: 8,
        groupCells: true,
        cellsPerSlide: 3,
      })
    ).toEqual({ enabled: true, fixedCount: 3 });
  });

  test("resolves numeric groupCells as fixed grouping without using cellsPerSlide", () => {
    expect(
      resolveSliderGroupCells({
        total: 8,
        groupCells: 2.8,
        cellsPerSlide: 4,
      })
    ).toEqual({ enabled: true, fixedCount: 2 });

    expect(
      resolveSliderGroupCells({
        total: 3,
        groupCells: 10,
      })
    ).toEqual({ enabled: true, fixedCount: 3 });

    expect(
      resolveSliderGroupCells({
        total: 8,
        groupCells: 1,
        cellsPerSlide: 4,
      })
    ).toEqual({ enabled: false, fixedCount: null });

    expect(
      resolveSliderGroupCells({
        total: 8,
        groupCells: 1.8,
        cellsPerSlide: 4,
      })
    ).toEqual({ enabled: false, fixedCount: null });

    expect(
      resolveSliderGroupCells({
        total: 8,
        groupCells: 0,
        cellsPerSlide: 4,
      })
    ).toEqual({ enabled: false, fixedCount: null });

    for (const groupCells of [-2, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(
        resolveSliderGroupCells({
          total: 8,
          groupCells,
          cellsPerSlide: 4,
        })
      ).toEqual({ enabled: false, fixedCount: null });
    }
  });

  test("contains center-aligned snaps inside non-loop scroll bounds", () => {
    expect(
      buildSliderScrollSnaps({
        targets: [0, 520, 1040],
        alignSizes: [500, 500, 500],
        viewport: 900,
        centerAlign: true,
      })
    ).toEqual([200, -320, -840]);

    expect(
      buildSliderScrollSnaps({
        targets: [0, 520, 1040],
        alignSizes: [500, 500, 500],
        viewport: 900,
        centerAlign: true,
        contentSpan: 1540,
        containScroll: true,
      })
    ).toEqual([0, -320, -640]);
  });

  test("merges pages that contain to the same bound snap", () => {
    const pages = mergeDuplicateContainedSliderPages({
      pages: [
        { target: 0, alignSize: 220, cells: [0] },
        { target: 240, alignSize: 420, cells: [1] },
        { target: 680, alignSize: 260, cells: [2] },
        { target: 2400, alignSize: 250, cells: [7] },
      ],
      viewport: 900,
      contentSpan: 2650,
      centerAlign: true,
      containScroll: true,
    });

    expect(pages).toEqual([
      { target: 0, alignSize: 220, cells: [0, 1] },
      { target: 680, alignSize: 260, cells: [2] },
      { target: 2400, alignSize: 250, cells: [7] },
    ]);
  });
});
