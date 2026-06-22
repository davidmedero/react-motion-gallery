import type {
  FullscreenEffectsOptions,
  FullscreenIntroPathTiming,
} from "./types";

export type FullscreenIntroPath = "transform" | "fade";

export const DEFAULT_FULLSCREEN_INTRO_TRANSFORM_DURATION_MS = 300;
export const DEFAULT_FULLSCREEN_INTRO_FADE_DURATION_MS = 500;
export const DEFAULT_FULLSCREEN_INTRO_EASING = "cubic-bezier(.4,0,.22,1)";

function isIntroPathTimingObject<T>(
  value: FullscreenIntroPathTiming<T> | undefined
): value is { transform?: T; fade?: T } {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function mergeFullscreenIntroPathTiming<T>(
  base: FullscreenIntroPathTiming<T> | undefined,
  layer: FullscreenIntroPathTiming<T> | undefined
): FullscreenIntroPathTiming<T> | undefined {
  if (layer == null) return base;

  if (isIntroPathTimingObject(base) && isIntroPathTimingObject(layer)) {
    return {
      ...base,
      ...layer,
    };
  }

  return layer;
}

export function resolveFullscreenIntroPathTiming<T>(
  value: FullscreenIntroPathTiming<T> | undefined,
  path: FullscreenIntroPath,
  fallback: T
): T {
  if (isIntroPathTimingObject(value)) {
    return value[path] ?? fallback;
  }

  return value ?? fallback;
}

export function resolveFullscreenIntroDurationMs(
  value: FullscreenEffectsOptions["transitionDuration"] | undefined,
  path: FullscreenIntroPath
) {
  const fallback =
    path === "fade"
      ? DEFAULT_FULLSCREEN_INTRO_FADE_DURATION_MS
      : DEFAULT_FULLSCREEN_INTRO_TRANSFORM_DURATION_MS;

  return resolveFullscreenIntroPathTiming(
    value,
    path,
    fallback
  );
}

export function resolveFullscreenIntroEasing(
  value: FullscreenEffectsOptions["transitionEasing"] | undefined,
  path: FullscreenIntroPath
) {
  return resolveFullscreenIntroPathTiming(
    value,
    path,
    DEFAULT_FULLSCREEN_INTRO_EASING
  );
}
