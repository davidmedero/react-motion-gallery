import type { ScrollTargetType } from "../shared/motion/scrollTarget";
import { mathSign } from "../shared/motion/scrollTarget";
import type { SliderSkipSnaps } from "./types";

export const DEFAULT_SLIDER_SKIP_SNAPS_THRESHOLD = 0;

export type ResolvedSliderSkipSnaps = {
  enabled: boolean;
  threshold: number;
};

export function resolveSliderSkipSnaps(skipSnaps?: SliderSkipSnaps): ResolvedSliderSkipSnaps {
  if (typeof skipSnaps === "object" && skipSnaps != null) {
    const threshold = Number.isFinite(skipSnaps.threshold)
      ? Math.max(0, skipSnaps.threshold ?? DEFAULT_SLIDER_SKIP_SNAPS_THRESHOLD)
      : DEFAULT_SLIDER_SKIP_SNAPS_THRESHOLD;

    return {
      enabled: skipSnaps.enabled ?? true,
      threshold,
    };
  }

  return {
    enabled: skipSnaps === true,
    threshold: DEFAULT_SLIDER_SKIP_SNAPS_THRESHOLD,
  };
}

function clampIndex(index: number, slideCount: number) {
  return Math.max(0, Math.min(slideCount - 1, index));
}

function normalizeIndex(index: number, slideCount: number, wrap: boolean) {
  const rounded = Math.trunc(index);
  if (!wrap) return clampIndex(rounded, slideCount);
  return ((rounded % slideCount) + slideCount) % slideCount;
}

function shouldUseSkipSnapTarget(args: {
  force: number;
  adjacentDistance: number;
  threshold: number;
}) {
  const { force, adjacentDistance, threshold } = args;
  if (threshold <= 0) return true;

  const adjacentAbs = Math.abs(adjacentDistance);
  if (adjacentAbs <= 0) return false;

  return Math.abs(force) >= adjacentAbs * threshold;
}

export function resolveSliderReleaseSnapForce(args: {
  force: number;
  fallbackDirection?: number;
  slideCount: number;
  currentIndex: number;
  dragStartIndex?: number;
  wrap: boolean;
  skipSnaps?: SliderSkipSnaps;
  strictSnaps?: boolean;
  scrollTarget: Pick<ScrollTargetType, "byDistance" | "byIndex">;
}) {
  const {
    force,
    fallbackDirection = 0,
    slideCount,
    wrap,
    skipSnaps,
    strictSnaps,
    scrollTarget,
  } = args;
  const len = slideCount || 1;
  if (len <= 1) return 0;

  const currentIndex = normalizeIndex(args.currentIndex || 0, len, wrap);
  const dragStartIndex = normalizeIndex(args.dragStartIndex ?? currentIndex, len, wrap);
  const forceDirection = mathSign(force);
  const fallbackDirectionSign = mathSign(fallbackDirection);

  function crossesLoopSeam(index: number, direction: number) {
    if (!wrap || direction === 0) return false;
    const nextIndex = index + direction * -1;
    return nextIndex < 0 || nextIndex > len - 1;
  }

  const useFallbackAtLoopSeam =
    strictSnaps &&
    forceDirection !== 0 &&
    fallbackDirectionSign !== 0 &&
    forceDirection !== fallbackDirectionSign &&
    (
      crossesLoopSeam(dragStartIndex, forceDirection) ||
      crossesLoopSeam(dragStartIndex, fallbackDirectionSign)
    );
  const strictDirection = useFallbackAtLoopSeam
    ? fallbackDirectionSign
    : forceDirection || fallbackDirectionSign;
  const dir = strictSnaps ? strictDirection : forceDirection;

  function adjacentDistanceFrom(index: number, direction: number) {
    if (direction === 0) return scrollTarget.byIndex(index, 0).distance;

    const dirIndex = direction * -1;
    let nextIndex = index + dirIndex;

    if (!wrap) {
      if (nextIndex < 0 || nextIndex > len - 1) {
        nextIndex = index;
      }
    } else {
      nextIndex = ((nextIndex % len) + len) % len;
    }

    const dirBump = len === 2 ? direction : 0;
    return scrollTarget.byIndex(nextIndex, dirBump).distance;
  }

  if (strictSnaps) {
    return adjacentDistanceFrom(dragStartIndex, dir);
  }

  if (dir === 0) return 0;

  const resolvedSkipSnaps = resolveSliderSkipSnaps(skipSnaps);
  if (!resolvedSkipSnaps.enabled) {
    return adjacentDistanceFrom(currentIndex, dir);
  }

  const adjacentDistance = adjacentDistanceFrom(currentIndex, dir);

  if (
    !shouldUseSkipSnapTarget({
      force,
      adjacentDistance,
      threshold: resolvedSkipSnaps.threshold,
    })
  ) {
    return adjacentDistance;
  }

  const baseTarget = scrollTarget.byDistance(force, true);
  let { index: proposedIndex } = baseTarget;
  const { distance } = baseTarget;

  if (proposedIndex !== currentIndex) {
    if (!wrap) {
      proposedIndex = clampIndex(proposedIndex, len);
      return scrollTarget.byIndex(proposedIndex, dir).distance;
    }

    return distance;
  }

  return adjacentDistance;
}
