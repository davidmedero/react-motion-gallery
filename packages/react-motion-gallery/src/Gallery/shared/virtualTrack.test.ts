import { describe, expect, test } from "vitest";

import {
  accumulateFixedVirtualTrackRebaseOffset,
  buildFixedVirtualTrackWindow,
  fixedVirtualTrackMetricsMatchViewport,
  normalizeVirtualIndex,
  resolveFixedVirtualTrackMetrics,
  resolveFixedVirtualTrackMetricsFromCellSize,
  resolveSliderVirtualizationOptions,
  sameFixedVirtualTrackWindow,
  sameFixedVirtualTrackWindowItems,
} from "./virtualTrack";

describe("fixed slider virtual track", () => {
  test("normalizes negative and overflow virtual indexes", () => {
    expect(normalizeVirtualIndex(-1, 10)).toBe(9);
    expect(normalizeVirtualIndex(10, 10)).toBe(0);
    expect(normalizeVirtualIndex(12, 10)).toBe(2);
  });

  test("resolves fixed-stride geometry from viewport, cells, and gap", () => {
    const metrics = resolveFixedVirtualTrackMetrics({
      count: 10,
      viewport: 300,
      cellsPerSlide: 3,
      gap: 12,
      loop: false,
    });

    expect(metrics).toMatchObject({
      count: 10,
      viewport: 300,
      cellsPerSlide: 3,
      cellSize: 92,
      gap: 12,
      stride: 104,
      baseSpan: 1028,
      trackSpan: 1028,
    });
  });

  test("detects stale fixed-stride metrics after viewport resize", () => {
    const metrics = resolveFixedVirtualTrackMetrics({
      count: 10,
      viewport: 300,
      cellsPerSlide: 3,
      gap: 12,
    });
    expect(metrics).not.toBeNull();

    expect(fixedVirtualTrackMetricsMatchViewport(metrics!, 300.5)).toBe(true);
    expect(fixedVirtualTrackMetricsMatchViewport(metrics!, 320)).toBe(false);
  });

  test("resolves fixed-stride geometry from explicit cell size", () => {
    const metrics = resolveFixedVirtualTrackMetricsFromCellSize({
      count: 24,
      viewport: 320,
      cellSize: 74,
      gap: 10,
      loop: true,
    });

    expect(metrics).toMatchObject({
      count: 24,
      viewport: 320,
      cellsPerSlide: 3,
      cellSize: 74,
      gap: 10,
      stride: 84,
      baseSpan: 2006,
      trackSpan: 2016,
    });
  });

  test("clamps non-loop windows to the logical item range", () => {
    const metrics = resolveFixedVirtualTrackMetrics({
      count: 10,
      viewport: 300,
      cellsPerSlide: 3,
      gap: 12,
    });
    expect(metrics).not.toBeNull();

    const start = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: 0,
      options: { enabled: true, overscan: 1, threshold: 0 },
    });
    const end = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: 600,
      options: { enabled: true, overscan: 1, threshold: 0 },
    });

    expect(start.items.map((item) => item.virtualIndex)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(end.items.map((item) => item.virtualIndex)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("allows loop windows to render negative and overflow virtual indexes", () => {
    const metrics = resolveFixedVirtualTrackMetrics({
      count: 10,
      viewport: 300,
      cellsPerSlide: 3,
      gap: 12,
      loop: true,
    });
    expect(metrics).not.toBeNull();

    const beforeStart = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: -60,
      loop: true,
      options: { enabled: true, overscan: 0, threshold: 0 },
    });
    const afterEnd = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: 980,
      loop: true,
      options: { enabled: true, overscan: 0, threshold: 0 },
    });

    expect(beforeStart.items.map((item) => item.virtualIndex)).toEqual([
      -4, -3, -2, -1, 0, 1, 2, 3, 4, 5,
    ]);
    expect(beforeStart.items.map((item) => item.canonicalIndex)).toEqual([
      6, 7, 8, 9, 0, 1, 2, 3, 4, 5,
    ]);
    expect(afterEnd.items.map((item) => item.virtualIndex)).toEqual([
      6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ]);
    expect(afterEnd.items.map((item) => item.canonicalIndex)).toEqual([
      6, 7, 8, 9, 0, 1, 2, 3, 4, 5,
    ]);
  });

  test("uses free-scroll coordinates instead of active indexes", () => {
    const metrics = resolveFixedVirtualTrackMetrics({
      count: 20,
      viewport: 320,
      cellsPerSlide: 4,
      gap: 8,
    });
    expect(metrics).not.toBeNull();

    const window = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: 500,
      options: { enabled: true, overscan: 1, threshold: 0 },
    });

    expect(window.from).toBe(2);
    expect(window.items[0]?.offset).toBeCloseTo(metrics!.stride * 2);
  });

  test("keeps at least a viewport of overscan for grouped resize stability", () => {
    const metrics = resolveFixedVirtualTrackMetrics({
      count: 40,
      viewport: 500,
      cellsPerSlide: 5,
      gap: 10,
    });
    expect(metrics).not.toBeNull();

    const window = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: metrics!.stride * 10,
      options: { enabled: true, overscan: 1, threshold: 0 },
    });

    expect(window.items.map((item) => item.virtualIndex)).toContain(6);
    expect(window.items.map((item) => item.virtualIndex)).toContain(10);
    expect(window.items.map((item) => item.virtualIndex)).toContain(14);
  });

  test("distinguishes virtual window cell identity from resize-only offsets", () => {
    const beforeMetrics = resolveFixedVirtualTrackMetrics({
      count: 40,
      viewport: 500,
      cellsPerSlide: 5,
      gap: 10,
    });
    const afterMetrics = resolveFixedVirtualTrackMetrics({
      count: 40,
      viewport: 600,
      cellsPerSlide: 5,
      gap: 10,
    });
    expect(beforeMetrics).not.toBeNull();
    expect(afterMetrics).not.toBeNull();

    const before = buildFixedVirtualTrackWindow({
      metrics: beforeMetrics!,
      scrollOffset: 1000,
      options: { enabled: true, overscan: 2, threshold: 0 },
    });
    const after = buildFixedVirtualTrackWindow({
      metrics: afterMetrics!,
      scrollOffset: 1200,
      options: { enabled: true, overscan: 2, threshold: 0 },
    });

    expect(before.items.map((item) => item.virtualIndex)).toEqual(
      after.items.map((item) => item.virtualIndex)
    );
    expect(sameFixedVirtualTrackWindowItems(before, after)).toBe(true);
    expect(sameFixedVirtualTrackWindow(before, after)).toBe(false);
  });

  test("builds a fixed-cell thumbnail-style window from continuous scroll", () => {
    const metrics = resolveFixedVirtualTrackMetricsFromCellSize({
      count: 30,
      viewport: 420,
      cellSize: 70,
      gap: 8,
    });
    expect(metrics).not.toBeNull();

    const window = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: 780,
      options: { enabled: true, overscan: 2, threshold: 0 },
    });

    expect(window.enabled).toBe(true);
    expect(window.from).toBe(4);
    expect(window.items[0]?.offset).toBeCloseTo(metrics!.stride * 4);
  });

  test("keeps loop windows populated around fullscreen seams", () => {
    const metrics = resolveFixedVirtualTrackMetrics({
      count: 12,
      viewport: 800,
      cellsPerSlide: 1,
      gap: 24,
      loop: true,
    });
    expect(metrics).not.toBeNull();

    const seam = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: metrics!.trackSpan - metrics!.viewport / 2,
      loop: true,
      options: { enabled: true, overscan: 1, threshold: 0 },
    });

    expect(seam.items.length).toBeGreaterThan(0);
    expect(seam.items.map((item) => item.canonicalIndex)).toContain(0);
  });

  test("falls back to full rendering at or below threshold", () => {
    const options = resolveSliderVirtualizationOptions({ enabled: true, threshold: 10 });
    const metrics = resolveFixedVirtualTrackMetrics({
      count: 10,
      viewport: 300,
      cellsPerSlide: 3,
      gap: 12,
    });
    expect(metrics).not.toBeNull();

    const window = buildFixedVirtualTrackWindow({
      metrics: metrics!,
      scrollOffset: 0,
      options,
    });

    expect(window.enabled).toBe(false);
    expect(window.items).toHaveLength(10);
  });

  test("compensates in the opposite direction of a loop rebase", () => {
    expect(accumulateFixedVirtualTrackRebaseOffset(0, -100)).toBe(100);
    expect(accumulateFixedVirtualTrackRebaseOffset(0, 100)).toBe(-100);
  });

  test("accumulates repeated loop rebase compensation before commit", () => {
    const once = accumulateFixedVirtualTrackRebaseOffset(0, -100);
    const twice = accumulateFixedVirtualTrackRebaseOffset(once, -100);
    const recovered = accumulateFixedVirtualTrackRebaseOffset(twice, 100);

    expect(once).toBe(100);
    expect(twice).toBe(200);
    expect(recovered).toBe(100);
  });
});
