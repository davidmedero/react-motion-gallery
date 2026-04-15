import { afterEach, describe, expect, test, vi } from "vitest";

import {
  SKELETON_MIN_VISIBLE_MS,
  getRemainingGridSkeletonVisibleMs,
  resolveGridLoadingActive,
  scheduleGridLoadingExit,
} from "./GridLayout";

describe("grid loading timing helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("reports the remaining minimum visible duration when loading becomes ready immediately", () => {
    expect(
      getRemainingGridSkeletonVisibleMs({
        loadingVisibleSinceMs: 1000,
        nowMs: 1000,
      })
    ).toBe(SKELETON_MIN_VISIBLE_MS);
  });

  test("returns zero once the minimum visible duration has already elapsed", () => {
    expect(
      getRemainingGridSkeletonVisibleMs({
        loadingVisibleSinceMs: 1000,
        nowMs: 1000 + SKELETON_MIN_VISIBLE_MS + 80,
      })
    ).toBe(0);
  });

  test("keeps the skeleton visible for at least 220ms before starting the normal exit", () => {
    vi.useFakeTimers();
    const setLoadingExiting = vi.fn();
    const setShowLoadingLayer = vi.fn();
    const setIntroUnlocked = vi.fn();

    scheduleGridLoadingExit({
      loadingVisibleSinceMs: 1000,
      nowMs: 1000,
      exitMs: 220,
      setLoadingExiting,
      setShowLoadingLayer,
      setIntroUnlocked,
    });

    vi.advanceTimersByTime(SKELETON_MIN_VISIBLE_MS - 1);
    expect(setLoadingExiting).not.toHaveBeenCalled();
    expect(setShowLoadingLayer).not.toHaveBeenCalled();
    expect(setIntroUnlocked).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setLoadingExiting).toHaveBeenCalledWith(true);
    expect(setShowLoadingLayer).not.toHaveBeenCalled();
    expect(setIntroUnlocked).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(219);
    expect(setShowLoadingLayer).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setShowLoadingLayer).toHaveBeenCalledWith(false);
    expect(setLoadingExiting).toHaveBeenLastCalledWith(false);
  });

  test("starts the normal exit immediately once content becomes ready after the minimum visible window", () => {
    vi.useFakeTimers();
    const setLoadingExiting = vi.fn();
    const setShowLoadingLayer = vi.fn();
    const setIntroUnlocked = vi.fn();

    scheduleGridLoadingExit({
      loadingVisibleSinceMs: 1000,
      nowMs: 1000 + SKELETON_MIN_VISIBLE_MS + 80,
      exitMs: 220,
      setLoadingExiting,
      setShowLoadingLayer,
      setIntroUnlocked,
    });

    expect(setLoadingExiting).toHaveBeenCalledWith(true);
    expect(setShowLoadingLayer).not.toHaveBeenCalled();
    expect(setIntroUnlocked).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(219);
    expect(setShowLoadingLayer).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setShowLoadingLayer).toHaveBeenCalledWith(false);
    expect(setLoadingExiting).toHaveBeenLastCalledWith(false);
  });

  test("still honors the 220ms minimum visible duration when reduced motion skips the fade", () => {
    vi.useFakeTimers();
    const setLoadingExiting = vi.fn();
    const setShowLoadingLayer = vi.fn();
    const setIntroUnlocked = vi.fn();

    scheduleGridLoadingExit({
      loadingVisibleSinceMs: 1000,
      nowMs: 1000,
      exitMs: 0,
      setLoadingExiting,
      setShowLoadingLayer,
      setIntroUnlocked,
    });

    vi.advanceTimersByTime(SKELETON_MIN_VISIBLE_MS - 1);
    expect(setShowLoadingLayer).not.toHaveBeenCalled();
    expect(setIntroUnlocked).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setLoadingExiting).toHaveBeenCalledWith(false);
    expect(setShowLoadingLayer).toHaveBeenCalledWith(false);
    expect(setIntroUnlocked).toHaveBeenCalledWith(true);
  });

  test("keeps loading disabled and forced logic unchanged", () => {
    expect(
      resolveGridLoadingActive({
        loadingEnabled: false,
        loadingForced: false,
        contentReady: false,
      })
    ).toBe(false);

    expect(
      resolveGridLoadingActive({
        loadingEnabled: true,
        loadingForced: false,
        contentReady: false,
      })
    ).toBe(true);

    expect(
      resolveGridLoadingActive({
        loadingEnabled: true,
        loadingForced: true,
        contentReady: true,
      })
    ).toBe(true);
  });
});
