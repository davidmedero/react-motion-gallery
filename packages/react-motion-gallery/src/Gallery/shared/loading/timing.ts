import type { LoadingTimingOptions } from "../types/transitions";

export const DEFAULT_SKELETON_EXIT_MS = 600;
export const DEFAULT_SKELETON_MIN_VISIBLE_MS = 220;

export type ResolvedLoadingTiming = {
  exitMs: number;
  minVisibleMs: number;
};

type LoadingExitSchedulerArgs = {
  loadingVisibleSinceMs: number | null;
  nowMs: number;
  exitMs: number;
  minVisibleMs?: number;
  setLoadingExiting: (value: boolean) => void;
  setShowLoadingLayer: (value: boolean) => void;
  setIntroUnlocked: (value: boolean) => void;
};

type ResolveLoadingTimingArgs = {
  prefersReducedMotion: boolean;
  timing?: LoadingTimingOptions;
  defaults?: Partial<ResolvedLoadingTiming>;
};

export function resolveLoadingTiming(args: ResolveLoadingTimingArgs): ResolvedLoadingTiming {
  const exitMsBase = Math.max(
    0,
    args.timing?.exitMs ?? args.defaults?.exitMs ?? DEFAULT_SKELETON_EXIT_MS
  );
  const minVisibleMs = Math.max(
    0,
    args.timing?.minVisibleMs ??
      args.defaults?.minVisibleMs ??
      DEFAULT_SKELETON_MIN_VISIBLE_MS
  );

  return {
    exitMs: args.prefersReducedMotion ? 0 : exitMsBase,
    minVisibleMs,
  };
}

export function getRemainingLoadingVisibleMs(args: {
  loadingVisibleSinceMs: number | null;
  nowMs: number;
  minVisibleMs?: number;
}) {
  const minVisibleMs = Math.max(
    0,
    args.minVisibleMs ?? DEFAULT_SKELETON_MIN_VISIBLE_MS
  );
  const visibleForMs =
    args.loadingVisibleSinceMs == null
      ? minVisibleMs
      : Math.max(0, args.nowMs - args.loadingVisibleSinceMs);

  return Math.max(0, minVisibleMs - visibleForMs);
}

export function scheduleLoadingExit(args: LoadingExitSchedulerArgs) {
  const remainingVisibleMs = getRemainingLoadingVisibleMs({
    loadingVisibleSinceMs: args.loadingVisibleSinceMs,
    nowMs: args.nowMs,
    minVisibleMs: args.minVisibleMs,
  });

  let minVisibleTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let introTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let exitTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const beginExit = () => {
    args.setIntroUnlocked(true);

    if (args.exitMs === 0) {
      args.setLoadingExiting(false);
      args.setShowLoadingLayer(false);
      return;
    }

    args.setLoadingExiting(true);

    exitTimeoutId = setTimeout(() => {
      args.setShowLoadingLayer(false);
      args.setLoadingExiting(false);
    }, args.exitMs);
  };

  if (remainingVisibleMs > 0) {
    minVisibleTimeoutId = setTimeout(() => {
      beginExit();
    }, remainingVisibleMs);
  } else {
    beginExit();
  }

  return () => {
    if (minVisibleTimeoutId !== null) {
      clearTimeout(minVisibleTimeoutId);
    }

    if (exitTimeoutId !== null) {
      clearTimeout(exitTimeoutId);
    }
  };
}
