export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export const DEFAULT_CROSSFADE_WHEEL_SENSITIVITY = 5;
export const DEFAULT_CROSSFADE_WHEEL_COMMIT_THRESHOLD = 0.38;
export const DEFAULT_CROSSFADE_WHEEL_SESSION_GAP_MS = 24;

export function resolveCrossfadeDragTarget(args: {
  currentIndex: number;
  delta: number;
  slideCount: number;
  wrap: boolean;
}) {
  const { currentIndex, delta, slideCount, wrap } = args;
  if (slideCount <= 1) return currentIndex;
  if (Math.abs(delta) < 0.5) return currentIndex;

  const requested = delta < 0 ? currentIndex + 1 : currentIndex - 1;

  if (wrap) {
    return ((requested % slideCount) + slideCount) % slideCount;
  }

  return Math.max(0, Math.min(slideCount - 1, requested));
}

export function shouldCompleteCrossfadeDrag(args: {
  progress: number;
  force: number;
  delta: number;
}) {
  const { progress, force, delta } = args;
  const normalizedProgress = clamp01(progress);

  if (normalizedProgress >= 0.5) return true;

  const dragDir = Math.sign(delta);
  const forceDir = Math.sign(force);

  return forceDir !== 0 && dragDir !== 0 && forceDir === dragDir && Math.abs(force) >= 0.05;
}

export function resolveCrossfadeWheelOptions(args: {
  controls?: boolean;
  wheel?:
    | boolean
    | {
        enabled?: boolean;
        sensitivity?: number;
        commitThreshold?: number;
        durationMs?: number;
        sessionGapMs?: number;
      };
  sharedDurationMs: number;
  defaults: {
    sensitivity: number;
    commitThreshold: number;
    sessionGapMs: number;
  };
}) {
  const { controls, wheel, sharedDurationMs, defaults } = args;
  const wheelOptions = typeof wheel === "object" && wheel != null ? wheel : null;
  const enabled =
    typeof wheel === "boolean"
      ? wheel
      : wheelOptions
        ? wheelOptions.enabled ?? true
        : controls ?? false;

  const sensitivity =
    typeof wheelOptions?.sensitivity === "number" &&
    Number.isFinite(wheelOptions.sensitivity)
      ? Math.max(0, wheelOptions.sensitivity)
      : defaults.sensitivity;
  const commitThreshold =
    typeof wheelOptions?.commitThreshold === "number" &&
    Number.isFinite(wheelOptions.commitThreshold)
      ? Math.max(0, Math.min(0.499, wheelOptions.commitThreshold))
      : defaults.commitThreshold;
  const durationMs =
    typeof wheelOptions?.durationMs === "number" &&
    Number.isFinite(wheelOptions.durationMs)
      ? Math.max(0, wheelOptions.durationMs)
      : sharedDurationMs;
  const sessionGapMs =
    typeof wheelOptions?.sessionGapMs === "number" &&
    Number.isFinite(wheelOptions.sessionGapMs)
      ? Math.max(0, wheelOptions.sessionGapMs)
      : defaults.sessionGapMs;

  return {
    enabled,
    sensitivity,
    commitThreshold,
    durationMs,
    sessionGapMs,
  };
}

export function resolveCrossfadeWheelTarget(args: {
  currentIndex: number;
  delta: number;
  slideCount: number;
  wrap: boolean;
}) {
  const { currentIndex, delta, slideCount, wrap } = args;
  if (slideCount <= 1) return currentIndex;
  if (!Number.isFinite(delta)) return currentIndex;
  if (Math.abs(delta) < 0.5) return currentIndex;

  const step = delta > 0 ? 1 : -1;
  const requested = currentIndex + step;
  return wrap
    ? ((requested % slideCount) + slideCount) % slideCount
    : Math.max(0, Math.min(slideCount - 1, requested));
}

export function resolveCrossfadeWheelProgress(args: {
  delta: number;
  distance: number;
}) {
  const { delta, distance } = args;
  if (!Number.isFinite(delta) || !Number.isFinite(distance) || distance <= 0) {
    return 0;
  }

  return clamp01(Math.abs(delta) / distance);
}

export function shouldCompleteCrossfadeWheel(args: {
  progress: number;
  threshold: number;
}) {
  const { progress, threshold } = args;
  if (!Number.isFinite(progress)) return false;

  const boundedThreshold = Math.max(0, Math.min(0.499, threshold));
  return clamp01(progress) >= boundedThreshold;
}

export function shouldTreatCrossfadeWheelAsSameSession(args: {
  now: number;
  direction: 1 | -1;
  sessionDirection: 1 | -1;
  lastEventTs: number;
  sessionGapMs: number;
}) {
  const {
    now,
    direction,
    sessionDirection,
    lastEventTs,
    sessionGapMs,
  } = args;
  if (
    !Number.isFinite(now) ||
    !Number.isFinite(lastEventTs)
  ) return false;
  if (direction !== sessionDirection) return false;
  return now - lastEventTs <= Math.max(0, sessionGapMs);
}
