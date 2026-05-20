import { afterEach, describe, expect, test, vi } from "vitest";

import {
  DEFAULT_SKELETON_EXIT_MS,
  DEFAULT_SKELETON_MIN_VISIBLE_MS,
  resolveLoadingTiming,
  scheduleLoadingExit,
} from "./timing";

describe("shared loading timing helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("uses the shared grid-style defaults when timing is omitted", () => {
    expect(
      resolveLoadingTiming({
        prefersReducedMotion: false,
      })
    ).toEqual({
      exitMs: DEFAULT_SKELETON_EXIT_MS,
      minVisibleMs: DEFAULT_SKELETON_MIN_VISIBLE_MS,
    });
  });

  test("allows overriding exit and minimum visible timing", () => {
    expect(
      resolveLoadingTiming({
        prefersReducedMotion: false,
        timing: {
          exitMs: 360,
          minVisibleMs: 45,
        },
      })
    ).toEqual({
      exitMs: 360,
      minVisibleMs: 45,
    });
  });

  test("reduced motion still keeps the configured minimum visible duration", () => {
    expect(
      resolveLoadingTiming({
        prefersReducedMotion: true,
        timing: {
          exitMs: 360,
          minVisibleMs: 45,
        },
      })
    ).toEqual({
      exitMs: 0,
      minVisibleMs: 45,
    });
  });

  test("unlocks intro just after exit begins after the minimum visible window", () => {
    vi.useFakeTimers();
    const setLoadingExiting = vi.fn();
    const setShowLoadingLayer = vi.fn();
    const setIntroUnlocked = vi.fn();

    scheduleLoadingExit({
      loadingVisibleSinceMs: 1000,
      nowMs: 1000 + DEFAULT_SKELETON_MIN_VISIBLE_MS + 50,
      exitMs: 220,
      setLoadingExiting,
      setShowLoadingLayer,
      setIntroUnlocked,
    });

    expect(setLoadingExiting).toHaveBeenCalledWith(true);
    expect(setIntroUnlocked).not.toHaveBeenCalled();
    expect(setShowLoadingLayer).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);
    expect(setIntroUnlocked).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(219);
    expect(setShowLoadingLayer).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setShowLoadingLayer).toHaveBeenCalledWith(false);
    expect(setLoadingExiting).toHaveBeenLastCalledWith(false);
  });

  test("can disable the minimum visible delay entirely", () => {
    vi.useFakeTimers();
    const setLoadingExiting = vi.fn();
    const setShowLoadingLayer = vi.fn();
    const setIntroUnlocked = vi.fn();

    scheduleLoadingExit({
      loadingVisibleSinceMs: 1000,
      nowMs: 1000,
      exitMs: 220,
      minVisibleMs: 0,
      setLoadingExiting,
      setShowLoadingLayer,
      setIntroUnlocked,
    });

    expect(setLoadingExiting).toHaveBeenCalledWith(true);
    expect(setIntroUnlocked).not.toHaveBeenCalled();
    expect(setShowLoadingLayer).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);
    expect(setIntroUnlocked).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(219);
    expect(setShowLoadingLayer).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setShowLoadingLayer).toHaveBeenCalledWith(false);
    expect(setLoadingExiting).toHaveBeenLastCalledWith(false);
  });
});
